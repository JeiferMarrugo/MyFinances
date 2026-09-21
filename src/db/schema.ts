import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  doublePrecision,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const userFinanceSettings = pgTable("user_finance_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  biweeklyFirstStartDay: integer("biweekly_first_start_day").default(1).notNull(),
  biweeklyFirstEndDay: integer("biweekly_first_end_day").default(15).notNull(),
  biweeklySecondStartDay: integer("biweekly_second_start_day")
    .default(16)
    .notNull(),
  biweeklySecondEndDay: integer("biweekly_second_end_day"),
  monthStartDay: integer("month_start_day").default(1).notNull(),
  quarterStartMonth: integer("quarter_start_month").default(1).notNull(),
  yearStartMonth: integer("year_start_month").default(1).notNull(),
  yearStartDay: integer("year_start_day").default(1).notNull(),
  installmentDueOffset: integer("installment_due_offset").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const passkey = pgTable(
  "passkey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    credentialID: text("credential_id").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at"),
    aaguid: text("aaguid"),
  },
  (table) => [
    index("passkey_userId_idx").on(table.userId),
    index("passkey_credentialID_idx").on(table.credentialID),
  ],
);

export const merchant = pgTable(
  "merchant",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    logoUrl: text("logo_url"),
    allowsCredit: boolean("allows_credit").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("merchant_userId_idx").on(table.userId)],
);

export const bank = pgTable(
  "bank",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    logoUrl: text("logo_url"),
    brandColor: text("brand_color").default("#7c3aed").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("bank_userId_idx").on(table.userId)],
);

export const card = pgTable(
  "card",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bankId: text("bank_id").references(() => bank.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    cardType: text("card_type").notNull(),
    lastFourDigits: text("last_four_digits"),
    brandColor: text("brand_color"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("card_userId_idx").on(table.userId),
    index("card_bankId_idx").on(table.bankId),
  ],
);

export const savingsGoal = pgTable(
  "savings_goal",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    cardId: text("card_id").references(() => card.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    targetAmount: doublePrecision("target_amount"),
    targetMonths: integer("target_months"),
    color: text("color").default("#7c3aed").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("savings_goal_userId_idx").on(table.userId),
    index("savings_goal_cardId_idx").on(table.cardId),
  ],
);

export const serviceType = pgTable(
  "service_type",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull(),
    description: text("description"),
    color: text("color").default("#7c3aed").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("service_type_userId_idx").on(table.userId)],
);

export const transaction = pgTable(
  "transaction",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    merchantId: text("merchant_id").references(() => merchant.id, {
      onDelete: "set null",
    }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    method: text("method").notNull(),
    amount: doublePrecision("amount").notNull(),
    occurredAt: timestamp("occurred_at").notNull(),
    status: text("status").default("completed").notNull(),
    notes: text("notes"),
    installmentsCount: integer("installments_count"),
    installmentAmount: doublePrecision("installment_amount"),
    creditAlreadyStarted: boolean("credit_already_started").default(false).notNull(),
    installmentsPaid: integer("installments_paid").default(0).notNull(),
    installmentFrequency: text("installment_frequency"),
    recurringIncomeId: text("recurring_income_id").references(
      () => recurringIncome.id,
      { onDelete: "set null" },
    ),
    recurringExpenseId: text("recurring_expense_id").references(
      () => recurringExpense.id,
      { onDelete: "set null" },
    ),
    savingsGoalId: text("savings_goal_id").references(() => savingsGoal.id, {
      onDelete: "set null",
    }),
    paidFromSavings: boolean("paid_from_savings").default(false).notNull(),
    loanId: text("loan_id"),
    includes4x1000: boolean("includes_4x1000").default(false).notNull(),
    gmfAmount: doublePrecision("gmf_amount").default(0).notNull(),
    recurringRunKey: text("recurring_run_key"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("transaction_userId_idx").on(table.userId),
    index("transaction_occurredAt_idx").on(table.occurredAt),
    index("transaction_recurringIncomeId_idx").on(table.recurringIncomeId),
    index("transaction_recurringExpenseId_idx").on(table.recurringExpenseId),
    index("transaction_savingsGoalId_idx").on(table.savingsGoalId),
    index("transaction_loanId_idx").on(table.loanId),
    uniqueIndex("transaction_recurring_run_key_unique_idx").on(
      table.recurringRunKey,
    ),
  ],
);

export const creditPaymentPlan = pgTable(
  "credit_payment_plan",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transaction.id, { onDelete: "cascade" }),
    confirmedAt: timestamp("confirmed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("credit_payment_plan_userId_idx").on(table.userId),
    uniqueIndex("credit_payment_plan_transactionId_unique_idx").on(
      table.transactionId,
    ),
  ],
);

export const creditPaymentPlanItem = pgTable(
  "credit_payment_plan_item",
  {
    id: text("id").primaryKey(),
    planId: text("plan_id")
      .notNull()
      .references(() => creditPaymentPlan.id, { onDelete: "cascade" }),
    installmentIndex: integer("installment_index").notNull(),
    installmentNumber: integer("installment_number").notNull(),
    paymentDate: timestamp("payment_date").notNull(),
    amount: doublePrecision("amount").notNull(),
    status: text("status").default("pending").notNull(),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("credit_payment_plan_item_planId_idx").on(table.planId),
    uniqueIndex("credit_payment_plan_item_unique_idx").on(
      table.planId,
      table.installmentIndex,
    ),
  ],
);

export const installmentPaymentReminder = pgTable(
  "installment_payment_reminder",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transaction.id, { onDelete: "cascade" }),
    installmentIndex: integer("installment_index").notNull(),
    reminderKind: text("reminder_kind").notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (table) => [
    index("installment_payment_reminder_userId_idx").on(table.userId),
    index("installment_payment_reminder_transactionId_idx").on(
      table.transactionId,
    ),
    uniqueIndex("installment_payment_reminder_unique_idx").on(
      table.transactionId,
      table.installmentIndex,
      table.reminderKind,
    ),
  ],
);

export const loanPerson = pgTable(
  "loan_person",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("loan_person_userId_idx").on(table.userId)],
);

export const loan = pgTable(
  "loan",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    borrowerId: text("borrower_id")
      .notNull()
      .references(() => loanPerson.id, { onDelete: "restrict" }),
    principalAmount: doublePrecision("principal_amount").notNull(),
    interestAmount: doublePrecision("interest_amount").default(0).notNull(),
    expectedDueDate: timestamp("expected_due_date"),
    fundedFrom: text("funded_from").notNull(),
    savingsGoalId: text("savings_goal_id").references(() => savingsGoal.id, {
      onDelete: "set null",
    }),
    status: text("status").default("outstanding").notNull(),
    lentAt: timestamp("lent_at").notNull(),
    repaidAt: timestamp("repaid_at"),
    repaymentDestination: text("repayment_destination"),
    repaidAmount: doublePrecision("repaid_amount"),
    notes: text("notes"),
    disbursementTransactionId: text("disbursement_transaction_id").references(
      () => transaction.id,
      { onDelete: "set null" },
    ),
    repaymentTransactionId: text("repayment_transaction_id").references(
      () => transaction.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("loan_userId_idx").on(table.userId),
    index("loan_borrowerId_idx").on(table.borrowerId),
    index("loan_status_idx").on(table.status),
  ],
);

export const savingsMovement = pgTable(
  "savings_movement",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    savingsGoalId: text("savings_goal_id")
      .notNull()
      .references(() => savingsGoal.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    amount: doublePrecision("amount").notNull(),
    occurredAt: timestamp("occurred_at").notNull(),
    transactionId: text("transaction_id").references(() => transaction.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("savings_movement_userId_idx").on(table.userId),
    index("savings_movement_savingsGoalId_idx").on(table.savingsGoalId),
    index("savings_movement_transactionId_idx").on(table.transactionId),
  ],
);

export const recurringExpense = pgTable(
  "recurring_expense",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull(),
    method: text("method").notNull(),
    budgetAmount: doublePrecision("budget_amount").notNull(),
    frequency: text("frequency").notNull(),
    dayOfMonth: integer("day_of_month").notNull(),
    startDate: timestamp("start_date").notNull(),
    nextRunAt: timestamp("next_run_at").notNull(),
    lastRunAt: timestamp("last_run_at"),
    autoRegister: boolean("auto_register").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("recurring_expense_userId_idx").on(table.userId),
    index("recurring_expense_nextRunAt_idx").on(table.nextRunAt),
  ],
);

export const recurringIncome = pgTable(
  "recurring_income",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull(),
    method: text("method").notNull(),
    amount: doublePrecision("amount").notNull(),
    frequency: text("frequency").notNull(),
    dayOfMonth: integer("day_of_month").notNull(),
    startDate: timestamp("start_date").notNull(),
    nextRunAt: timestamp("next_run_at").notNull(),
    lastRunAt: timestamp("last_run_at"),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("recurring_income_userId_idx").on(table.userId),
    index("recurring_income_nextRunAt_idx").on(table.nextRunAt),
  ],
);

export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  passkeys: many(passkey),
  merchants: many(merchant),
  banks: many(bank),
  cards: many(card),
  serviceTypes: many(serviceType),
  savingsGoals: many(savingsGoal),
  loanPersons: many(loanPerson),
  loans: many(loan),
  transactions: many(transaction),
  recurringIncomes: many(recurringIncome),
  recurringExpenses: many(recurringExpense),
  financeSettings: one(userFinanceSettings, {
    fields: [user.id],
    references: [userFinanceSettings.userId],
  }),
}));

export const userFinanceSettingsRelations = relations(
  userFinanceSettings,
  ({ one }) => ({
    user: one(user, {
      fields: [userFinanceSettings.userId],
      references: [user.id],
    }),
  }),
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));

export const merchantRelations = relations(merchant, ({ one, many }) => ({
  user: one(user, {
    fields: [merchant.userId],
    references: [user.id],
  }),
  transactions: many(transaction),
}));

export const bankRelations = relations(bank, ({ one, many }) => ({
  user: one(user, {
    fields: [bank.userId],
    references: [user.id],
  }),
  cards: many(card),
}));

export const cardRelations = relations(card, ({ one, many }) => ({
  user: one(user, {
    fields: [card.userId],
    references: [user.id],
  }),
  bank: one(bank, {
    fields: [card.bankId],
    references: [bank.id],
  }),
  savingsGoals: many(savingsGoal),
}));

export const savingsGoalRelations = relations(savingsGoal, ({ one, many }) => ({
  user: one(user, {
    fields: [savingsGoal.userId],
    references: [user.id],
  }),
  card: one(card, {
    fields: [savingsGoal.cardId],
    references: [card.id],
  }),
  movements: many(savingsMovement),
  transactions: many(transaction),
  loans: many(loan),
}));

export const loanPersonRelations = relations(loanPerson, ({ one, many }) => ({
  user: one(user, {
    fields: [loanPerson.userId],
    references: [user.id],
  }),
  loans: many(loan),
}));

export const loanRelations = relations(loan, ({ one }) => ({
  user: one(user, {
    fields: [loan.userId],
    references: [user.id],
  }),
  borrower: one(loanPerson, {
    fields: [loan.borrowerId],
    references: [loanPerson.id],
  }),
  savingsGoal: one(savingsGoal, {
    fields: [loan.savingsGoalId],
    references: [savingsGoal.id],
  }),
  disbursementTransaction: one(transaction, {
    fields: [loan.disbursementTransactionId],
    references: [transaction.id],
    relationName: "loanDisbursement",
  }),
  repaymentTransaction: one(transaction, {
    fields: [loan.repaymentTransactionId],
    references: [transaction.id],
    relationName: "loanRepayment",
  }),
}));

export const savingsMovementRelations = relations(savingsMovement, ({ one }) => ({
  user: one(user, {
    fields: [savingsMovement.userId],
    references: [user.id],
  }),
  savingsGoal: one(savingsGoal, {
    fields: [savingsMovement.savingsGoalId],
    references: [savingsGoal.id],
  }),
  transaction: one(transaction, {
    fields: [savingsMovement.transactionId],
    references: [transaction.id],
  }),
}));

export const serviceTypeRelations = relations(serviceType, ({ one }) => ({
  user: one(user, {
    fields: [serviceType.userId],
    references: [user.id],
  }),
}));

export const creditPaymentPlanRelations = relations(
  creditPaymentPlan,
  ({ one, many }) => ({
    user: one(user, {
      fields: [creditPaymentPlan.userId],
      references: [user.id],
    }),
    transaction: one(transaction, {
      fields: [creditPaymentPlan.transactionId],
      references: [transaction.id],
    }),
    items: many(creditPaymentPlanItem),
  }),
);

export const creditPaymentPlanItemRelations = relations(
  creditPaymentPlanItem,
  ({ one }) => ({
    plan: one(creditPaymentPlan, {
      fields: [creditPaymentPlanItem.planId],
      references: [creditPaymentPlan.id],
    }),
  }),
);

export const transactionRelations = relations(transaction, ({ one }) => ({
  user: one(user, {
    fields: [transaction.userId],
    references: [user.id],
  }),
  merchant: one(merchant, {
    fields: [transaction.merchantId],
    references: [merchant.id],
  }),
  recurringIncome: one(recurringIncome, {
    fields: [transaction.recurringIncomeId],
    references: [recurringIncome.id],
  }),
  recurringExpense: one(recurringExpense, {
    fields: [transaction.recurringExpenseId],
    references: [recurringExpense.id],
  }),
  savingsGoal: one(savingsGoal, {
    fields: [transaction.savingsGoalId],
    references: [savingsGoal.id],
  }),
  loan: one(loan, {
    fields: [transaction.loanId],
    references: [loan.id],
  }),
  paymentPlan: one(creditPaymentPlan, {
    fields: [transaction.id],
    references: [creditPaymentPlan.transactionId],
  }),
}));

export const recurringIncomeRelations = relations(
  recurringIncome,
  ({ one, many }) => ({
    user: one(user, {
      fields: [recurringIncome.userId],
      references: [user.id],
    }),
    transactions: many(transaction),
  }),
);

export const recurringExpenseRelations = relations(
  recurringExpense,
  ({ one, many }) => ({
    user: one(user, {
      fields: [recurringExpense.userId],
      references: [user.id],
    }),
    transactions: many(transaction),
  }),
);
