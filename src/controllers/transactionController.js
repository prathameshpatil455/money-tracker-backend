import Transaction from "../models/Transaction.js";

export const getTransactions = async (req, res) => {
  const { page = 1, limit = 10, type, category, search, from, to } = req.query;
  const query = { user: req.user._id };

  if (type) query.type = type;
  if (category) query.category = category;
  if (search) query.description = { $regex: search, $options: "i" };
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const transactions = await Transaction.find(query)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const count = await Transaction.countDocuments(query);

  res.json({
    transactions,
    total: count,
    page: Number(page),
    pages: Math.ceil(count / limit),
  });
};

export const createTransaction = async (req, res) => {
  const { type, amount, category, description, date } = req.body;
  const transaction = new Transaction({
    user: req.user._id,
    type,
    amount,
    category,
    description,
    date,
  });
  await transaction.save();
  res.status(201).json(transaction);
};

export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { type, amount, category, description, date } = req.body;

  const updated = await Transaction.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { type, amount, category, description, date },
    { new: true }
  );

  if (!updated) {
    return res
      .status(404)
      .json({ message: "Transaction not found or not yours" });
  }

  res.json(updated);
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const deleted = await Transaction.findOneAndDelete({
    _id: id,
    user: req.user._id,
  });
  if (!deleted)
    return res.status(404).json({ message: "Transaction not found" });
  res.json({ message: "Transaction deleted" });
};

export const getExpenseTransactions = async (req, res) => {
  req.query.type = "expense";
  return getTransactions(req, res);
};

export const getIncomeTransactions = async (req, res) => {
  req.query.type = "income";
  return getTransactions(req, res);
};

export const getTransactionSummary = async (req, res) => {
  const userId = req.user._id;

  const [incomeAgg, expenseAgg] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: userId, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalIncome = incomeAgg[0]?.total || 0;
  const totalExpense = expenseAgg[0]?.total || 0;
  const balance = totalIncome - totalExpense;

  res.json({ totalIncome, totalExpense, balance });
};

export const getTransactionCategories = async (req, res) => {
  const userId = req.user._id;

  const categories = await Transaction.distinct("category", { user: userId });

  res.json({ categories });
};

export const getTransactionById = async (req, res) => {
  const { id } = req.params;

  const transaction = await Transaction.findOne({
    _id: id,
    user: req.user._id,
  });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  res.json(transaction);
};

export const deleteManyTransactions = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid or empty ID list" });
  }

  const result = await Transaction.deleteMany({
    _id: { $in: ids },
    user: req.user._id,
  });

  res.json({ deletedCount: result.deletedCount });
};
