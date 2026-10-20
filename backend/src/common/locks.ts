// Trava o registro lido até o fim da transação. Quem tentar mexer nele ao
// mesmo tempo espera a vez, o que impede dois pedidos de gastarem o mesmo
// caixa ou venderem o mesmo jogador juntos.
export const LOCK_FOR_UPDATE = { mode: 'pessimistic_write' } as const;
