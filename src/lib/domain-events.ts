export type DomainEvent =
  | 'accountsChanged'
  | 'categoriesChanged'
  | 'transactionReferencesChanged'
  | 'transactionsChanged'
  | 'budgetsChanged';

type DomainEventListener = () => void;

const listenersByEvent: Record<DomainEvent, Set<DomainEventListener>> = {
  accountsChanged: new Set(),
  categoriesChanged: new Set(),
  transactionReferencesChanged: new Set(),
  transactionsChanged: new Set(),
  budgetsChanged: new Set(),
};

export function subscribeDomainEvents(
  events: readonly DomainEvent[],
  listener: DomainEventListener
) {
  for (const event of events) {
    listenersByEvent[event].add(listener);
  }

  return () => {
    for (const event of events) {
      listenersByEvent[event].delete(listener);
    }
  };
}

export function emitDomainEvents(...events: readonly DomainEvent[]) {
  const listeners = new Set<DomainEventListener>();

  for (const event of events) {
    for (const listener of listenersByEvent[event]) {
      listeners.add(listener);
    }
  }

  for (const listener of listeners) {
    listener();
  }
}
