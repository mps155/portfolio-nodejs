// Middleware simples que simula um usuário logado.
// Permite passar `x-user-account-id` no header para escolher a conta origem.

const { getAccountById } = require('../data');

async function authSimulated(req, res, next) {
  try {
    const headerId = req.header('x-user-account-id');
    const accountId = headerId ? String(headerId) : '64bc833f8c6a5e76f413fb34'; // ID padrão para simulação
    const account = await getAccountById(accountId);
    if (!account) {
      return res.status(401).json({ error: 'Conta do usuário não encontrada (simulada)' });
    }
    req.user = { accountId: account._id.toString() };
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Erro no middleware de autenticação' });
  }
}

module.exports = authSimulated;
