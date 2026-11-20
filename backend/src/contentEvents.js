const clients = new Set();

export function connectContentClient(response) {
  clients.add(response);
  return () => clients.delete(response);
}

export function publishContentChanged() {
  for (const client of clients) {
    if (client.destroyed || client.writableEnded) {
      clients.delete(client);
      continue;
    }
    client.write('event: content-updated\ndata: {}\n\n');
  }
}
