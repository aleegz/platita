import { emitDomainEvents, subscribeDomainEvents } from './domain-events';

describe('domain events', () => {
  it('notifies listeners subscribed to an emitted event', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeDomainEvents(['transactionsChanged'], listener);

    emitDomainEvents('transactionsChanged');

    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('deduplicates listeners subscribed to multiple emitted events', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeDomainEvents(
      ['transactionsChanged', 'transactionReferencesChanged'],
      listener
    );

    emitDomainEvents('transactionsChanged', 'transactionReferencesChanged');

    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('stops notifying listeners after unsubscribe', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeDomainEvents(['budgetsChanged'], listener);

    unsubscribe();
    emitDomainEvents('budgetsChanged');

    expect(listener).not.toHaveBeenCalled();
  });
});
