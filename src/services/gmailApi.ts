export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  labelIds: string[];
  isUnread: boolean;
  isStarred: boolean;
}

export interface GmailMessageDetail extends GmailMessageSummary {
  bodyHtml?: string;
  bodyText?: string;
  cc?: string;
  replyTo?: string;
}

// Utility to decode Base64 / Base64URL safely handling UTF-8
function decodeBase64Utf8(str: string): string {
  try {
    const cleanStr = str.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(cleanStr);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.error('Failed to decode base64 string', e);
    return '';
  }
}

// Utility to encode string to Base64URL UTF-8
function encodeBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const fetchGmailProfile = async (accessToken: string): Promise<GmailProfile> => {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Erreur profil Gmail (${response.status})`);
  }

  return response.json();
};

export const listGmailMessages = async (
  accessToken: string,
  query = '',
  maxResults = 15,
  pageToken?: string
): Promise<{ messages: { id: string; threadId: string }[]; nextPageToken?: string }> => {
  const params = new URLSearchParams({
    maxResults: String(maxResults),
  });
  if (query.trim()) {
    params.append('q', query.trim());
  }
  if (pageToken) {
    params.append('pageToken', pageToken);
  }

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Erreur de récupération des emails (${response.status})`);
  }

  const data = await response.json();
  return {
    messages: data.messages || [],
    nextPageToken: data.nextPageToken,
  };
};

export const getGmailMessageDetail = async (
  accessToken: string,
  messageId: string
): Promise<GmailMessageDetail> => {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Erreur message (${response.status})`);
  }

  const data = await response.json();
  const headers = data.payload?.headers || [];

  const getHeader = (name: string): string => {
    const h = headers.find((item: any) => item.name?.toLowerCase() === name.toLowerCase());
    return h?.value || '';
  };

  const subject = getHeader('Subject') || '(Sans objet)';
  const from = getHeader('From') || 'Expéditeur inconnu';
  const to = getHeader('To') || '';
  const date = getHeader('Date') || '';
  const cc = getHeader('Cc') || undefined;
  const replyTo = getHeader('Reply-To') || undefined;
  const labelIds: string[] = data.labelIds || [];

  let bodyHtml = '';
  let bodyText = '';

  const extractBody = (part: any) => {
    if (!part) return;
    if (part.mimeType === 'text/html' && part.body?.data) {
      bodyHtml = decodeBase64Utf8(part.body.data);
    } else if (part.mimeType === 'text/plain' && part.body?.data) {
      bodyText = decodeBase64Utf8(part.body.data);
    }

    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(extractBody);
    }
  };

  if (data.payload?.body?.data) {
    if (data.payload.mimeType === 'text/html') {
      bodyHtml = decodeBase64Utf8(data.payload.body.data);
    } else {
      bodyText = decodeBase64Utf8(data.payload.body.data);
    }
  }

  if (data.payload?.parts) {
    data.payload.parts.forEach(extractBody);
  }

  return {
    id: data.id,
    threadId: data.threadId,
    subject,
    from,
    to,
    date,
    snippet: data.snippet || '',
    labelIds,
    isUnread: labelIds.includes('UNREAD'),
    isStarred: labelIds.includes('STARRED'),
    bodyHtml: bodyHtml || undefined,
    bodyText: bodyText || (!bodyHtml ? data.snippet : undefined),
    cc,
    replyTo,
  };
};

export const sendGmailMessage = async (
  accessToken: string,
  params: {
    to: string;
    subject: string;
    body: string;
    cc?: string;
  }
): Promise<{ id: string; threadId: string }> => {
  const { to, subject, body, cc } = params;

  // Format RFC 2822 email message with UTF-8
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to.trim()}`,
    ...(cc?.trim() ? [`Cc: ${cc.trim()}`] : []),
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body.trim().replace(/\n/g, '<br/>'),
  ];

  const rawEmail = emailLines.join('\r\n');
  const encodedEmail = encodeBase64Url(rawEmail);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedEmail,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Échec de l'envoi de l'email (${response.status})`);
  }

  return response.json();
};

export const trashGmailMessage = async (
  accessToken: string,
  messageId: string
): Promise<void> => {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Impossible de supprimer l'email (${response.status})`);
  }
};

export const modifyGmailLabels = async (
  accessToken: string,
  messageId: string,
  addLabelIds: string[],
  removeLabelIds: string[]
): Promise<void> => {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addLabelIds,
        removeLabelIds,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Erreur de modification du message (${response.status})`);
  }
};
