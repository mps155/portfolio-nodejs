const { connect, getCollection } = require("./db");
const { ObjectId } = require("mongodb");

async function getAccountById(id) {
  const accounts = getCollection("Owner");
  console.log("getAccountById called with id:", id);
  try {
    return await accounts.findOne({ _id: new ObjectId(id) });
  } catch (err) {
    return null;
  }
}

async function getWallets(id) {

    const wallets = getCollection("Wallet");
    return await wallets.find({OwnerId: id}).toArray();
}

async function transferFunds(fromId, toId, amount) {
  const accounts = getCollection("Wallet");
  const transactions = getCollection("TransferenceHistory");

  if (amount <= 0) throw new Error("Valor deve ser maior que zero");

  let fromObjId, toObjId;
  try {
    fromObjId = new ObjectId(fromId);
    toObjId = new ObjectId(toId);
  } catch (err) {
    throw new Error("ID da conta inválido");
  }

  // subtrair do remetente somente se houver saldo suficiente
  const dec = await accounts.updateOne(
    { _id: fromObjId, balance: { $gte: amount } },
    { $inc: { balance: -amount } }
  );
  if (dec.matchedCount === 0 || dec.modifiedCount === 0) {
    throw new Error("Saldo insuficiente ou conta origem não encontrada");
  }

  // adicionar ao destinatário
  const inc = await accounts.updateOne(
    { _id: toObjId },
    { $inc: { balance: amount } }
  );
  if (inc.matchedCount === 0) {
    // tentar reverter débito
    await accounts.updateOne({ _id: fromObjId }, { $inc: { balance: amount } });
    throw new Error("Conta destino não encontrada");
  }

  // obter saldos atuais
  const from = await accounts.findOne({ _id: fromObjId });
  const to = await accounts.findOne({ _id: toObjId });

  const tx = {
    fromAccountId: fromObjId,
    toAccountId: toObjId,
    amount,
    timestamp: new Date(),
    fromBalance: from.balance,
    toBalance: to.balance,
  };

  const r = await transactions.insertOne(tx);
  tx._id = r.insertedId;
  return tx;
}

async function getTransactionsByAccount(accountId) {
  const transactions = getCollection("TransferenceHistory");
  try {
    return await transactions
      .find({ $or: [{ SourceWalletId: accountId }, { TargetWalletId: accountId }] })
      .sort({ Date: -1 })
      .toArray();
  } catch (err) {
    return [];
  }
}

// Consulta simples na collection DEXUSEU por intervalo de datas
// startDateStr e endDateStr devem estar no formato mm-dd-yyyy
async function queryDexUseuByDateRange(startDateStr, endDateStr, dateField = 'observation_date') {
  const coll = getCollection('DEXUSEU');

  // Validar formato YYYY-MM-DD
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(startDateStr) || !re.test(endDateStr)) {
    throw new Error('Data deve estar no formato YYYY-MM-DD');
  }

  // Comparação lexicográfica direta com strings
  const pipeline = [
    { $match: { [dateField]: { $gte: startDateStr, $lte: endDateStr } } },
  ];

  return await coll.aggregate(pipeline).toArray();
}

module.exports = {
  getAccountById,
  transferFunds,
  getTransactionsByAccount,
  getWallets,
  queryDexUseuByDateRange,
};
