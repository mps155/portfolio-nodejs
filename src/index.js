const express = require("express");
const authSimulated = require("./middleware/auth");
const db = require("./db");
const cors = require("cors");
const {
  getAccountById,
  transferFunds,
  getTransactionsByAccount,
  getWallets,
  queryDexUseuByDateRange,
} = require("./data");

const app = express();
app.use(express.json());
app.use(authSimulated);

const originPermitida = "http://localhost:4200";

app.use(
  cors({
    origin: originPermitida,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

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
    const headerId = req.header("x-user-account-id");
    const accountId = headerId ? String(headerId) : "64bc833f8c6a5e76f413fb34";
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

// Consultar DEXUSEU por intervalo de datas
app.get("/dexuseu", async (req, res) => {
  try {
    const { start, end, dateField } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .json({
          error: "Query params start and end required, format YYYY-MM-DD",
        });
    }

    const re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(start) || !re.test(end)) {
      return res
        .status(400)
        .json({ error: "Invalid date format, use YYYY-MM-DD" });
    }

    const records = await queryDexUseuByDateRange(
      start,
      end,
      dateField || "observation_date"
    );
    return res.json(records);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
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
