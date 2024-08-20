export type HistoryData<
    Enum extends Record<string, any>,
    Types extends TransactionType<Enum> = TransactionType<Enum>
> = {
    [K in keyof Enum]: {
        type: Enum[K];
        data: Types[Enum[K]];
    }
}[keyof Enum];

type TransactionData<Enum extends Record<string, any>> = {
    history: HistoryData<Enum>[];
};
type TransactionHandler<
    Enum extends Record<string, any>,
    Types extends TransactionType<Enum> = TransactionType<Enum>
> =
    (data: HistoryData<Enum, Types>) => void;
export type TransactionType<Enum extends Record<string, any>> = {
    [K in Enum[keyof Enum]]: any;
};

export class Transaction<
    Enum extends Record<string, any>,
    Types extends TransactionType<Enum> = TransactionType<Enum>
> {
    undoHandler: TransactionHandler<Enum>;
    private history: TransactionData<Enum>[] = [];
    private currentTransaction: TransactionData<Enum> | null = null;

    constructor(undoHandler: TransactionHandler<Enum, Types>) {
        this.undoHandler = undoHandler;
    }

    /**
     * Start a new transaction
     */
    startTransaction(): this {
        if (this.currentTransaction) {
            console.warn('Transaction already started');
            return this;
        }
        this.currentTransaction = {
            history: [],
        };
        return this;
    }

    /**
     * Commit the current transaction
     * @returns the token of the transaction
     */
    commit(): TransactionData<Enum> | null {
        if (!this.currentTransaction) {
            console.warn('No transaction to commit');
            return null;
        }
        this.history.push(this.currentTransaction);
        this.currentTransaction = null;
        return this.history[this.history.length - 1]!;
    }

    commitWith<T extends Enum[keyof Enum]>(history: {
        type: T;
        data: Types[Enum[T]];
    }): this {
        this.startTransaction()
            .push(history)
            .commit();
        return this;
    }

    /**
     * Undo a transaction
     * @param token the token of the transaction to undo
     */
    undo(token?: TransactionData<Enum>) {
        const transaction = token || this.history.pop();
        for (let i = transaction.history.length - 1; i >= 0; i--) {
            this.undoHandler(transaction.history[i]);
        }
        if (token) {
            this.history = this.history.filter(t => t !== token);
        }
    }

    /**
     * Add a history to the current transaction
     * @param history the history to add
     */
    push<T extends Enum[keyof Enum]>(history: {
        type: T;
        data: Types[Enum[T]];
    }): this {
        if (!this.currentTransaction) {
            console.warn('No transaction to add history to');
            return this;
        }
        this.currentTransaction.history.push(history);
        return this;
    }
}

