import { describe, it, expect } from 'vitest';
import { libraryReducer } from './LibraryContext';

describe('LibraryContext Reducer', () => {
  const initialState = {
    books: [
      { id: 'b1', title: 'Test Book', available: 5, copies: 5 }
    ],
    transactions: [],
    reviews: [],
    wishlist: []
  };

  it('should handle ISSUE_BOOK by decreasing available copies', () => {
    const transaction = { id: 't1', bookId: 'b1', userId: 'u1', status: 'active' };
    const action = { type: 'ISSUE_BOOK', transaction };
    const nextState = libraryReducer(initialState, action);

    expect(nextState.books[0].available).toBe(4);
    expect(nextState.transactions).toHaveLength(1);
    expect(nextState.transactions[0].id).toBe('t1');
  });

  it('should handle RETURN_BOOK by increasing available copies', () => {
    const stateWithIssue = {
      ...initialState,
      books: [{ id: 'b1', title: 'Test Book', available: 4, copies: 5 }],
      transactions: [{ id: 't1', bookId: 'b1', userId: 'u1', status: 'active' }]
    };

    const action = { 
      type: 'RETURN_BOOK', 
      transactionId: 't1', 
      fine: 0, 
      returnDate: new Date().toISOString() 
    };
    const nextState = libraryReducer(stateWithIssue, action);

    expect(nextState.books[0].available).toBe(5);
    expect(nextState.transactions[0].status).toBe('returned');
  });

  it('should handle ADD_REVIEW correctly', () => {
    const review = { id: 'rev1', bookId: 'b1', rating: 5, comment: 'Great!' };
    const action = { type: 'ADD_REVIEW', review };
    const nextState = libraryReducer(initialState, action);

    expect(nextState.reviews).toHaveLength(1);
    expect(nextState.reviews[0].comment).toBe('Great!');
  });

  it('should handle TOGGLE_WISHLIST (add)', () => {
    const action = { type: 'TOGGLE_WISHLIST', bookId: 'b1', userId: 'u1' };
    const nextState = libraryReducer(initialState, action);

    expect(nextState.wishlist).toHaveLength(1);
    expect(nextState.wishlist[0].bookId).toBe('b1');
  });

  it('should handle TOGGLE_WISHLIST (remove)', () => {
    const stateWithWish = {
      ...initialState,
      wishlist: [{ bookId: 'b1', userId: 'u1' }]
    };
    const action = { type: 'TOGGLE_WISHLIST', bookId: 'b1', userId: 'u1' };
    const nextState = libraryReducer(stateWithWish, action);

    expect(nextState.wishlist).toHaveLength(0);
  });
});
