const express = require("express");
const authSimulated = require("./middleware/auth");
const db = require("./db");
const {
  getAccountById,
  transferFunds,
  getTransactionsByAccount,
  getWallets,
} = require("./data");

const app = express();
app.use(express.json());
app.use(authSimulated);

app.post("/transactions", async (req, res) => {
  try {
    const fromAccountId = req.user && req.user.accountId;
    const { toAccountId, amount } = req.body;

    if (!toAccountId)
      return res.status(400).json({ error: "Campo toAccountId é obrigatório" });
    if (amount === undefined || amount === null)
      return res.status(400).json({ error: "Campo amount é obrigatório" });

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0)
      return res.status(400).json({ error: "Campo amount inválido" });

    const fromAcct = await getAccountById(fromAccountId);
    if (!fromAcct)
      return res.status(404).json({ error: "Conta origem não encontrada" });

    const savedTx = await transferFunds(
      fromAccountId,
      toAccountId,
      parsedAmount
    );
    return res.status(201).json({ success: true, transaction: savedTx });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Consultar carteiras da conta logada
app.get("/wallets/", async (req, res) => {
  try {
    const headerId = req.header('x-user-account-id');
    const accountId = headerId ? String(headerId) : '64bc833f8c6a5e76f413fb34'; 
    const acct = await getWallets(accountId);
    if (!acct) return res.status(404).json({ error: "WALLETNOTFOUND" });
    res.json(acct);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});


// Consultar histórico de transações de uma conta específica
app.get("/wallet/transactions/:id", async (req, res) => {
  const list = await getTransactionsByAccount(req.params.id);
  res.json({ transactions: list });
});

const PORT = process.env.PORT || 3000;

// Conectar no MongoDB e iniciar o servidor
(async () => {
  try {
    await db.connect();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
})();
