// solution
const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./db');

const app = express();
app.use(bodyParser.json());

// Admin can see all total balance of all cryptocurrency. - Get user balance
app.get('/balance/:user_id', (req, res) => {
    const userId = req.params.user_id;
    connection.query(`SELECT * FROM balances WHERE user_id = ${userId}`, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Admin can increase and decrease user cryptocurrency balance. - Update user balance
app.put('/balance/:user_id', (req, res) => {
    const userId = req.params.user_id;
    const { currency, amount } = req.body;
    connection.query(`UPDATE balances SET amount = ${amount} WHERE user_id = ${userId} AND currency = '${currency}'`, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Balance updated' });
    });
});

// Add Crpto - Admin can add other cryptocurrency such XRP, EOS, XLM to wallet.
app.post('/cryptocurrency', (req, res) => {
    const { name } = req.body;
    connection.query(`SELECT name FROM cryptocurrency WHERE name = '${name}'`, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            connection.query(`INSERT INTO cryptocurrency (name) VALUES ('${name}')`, (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                connection.query(`SELECT currency FROM balances WHERE currency = '${name}'`, (err, results) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    if (results.length === 0) {
                        connection.query(`SELECT id FROM users`, (err, results) => {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }
                            for (let i = 0; i < results.length; i++) {
                                connection.query(`INSERT INTO balances (user_id, currency, amount) VALUES (${results[i].id}, '${name}', 0.00000000)`, (err) => {
                                    if (err) {
                                        return res.status(500).json({ error: err.message });
                                    }
                                });
                            }
                        });
                    }
                    res.json({ message: 'Cryptocurrency added successfully' });
                });
            });
        } else {
            res.json({ message: 'Cryptocurrency already exist' });
        }
    });
});

// Get exchange rate
app.get('/rate/:from_currency/:to_currency', (req, res) => {
    const { from_currency, to_currency } = req.params;
    connection.query(`SELECT rate FROM exchange_rate WHERE from_currency = '${from_currency}' AND to_currency = '${to_currency}'`, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results[0]);
    });
});

// Admin can manage exchange rate between cryptocurrency. - Update exchange rate
app.put('/rate/:from_currency/:to_currency', (req, res) => {
    const { from_currency, to_currency } = req.params;
    const { rate } = req.body;
    connection.query(`UPDATE exchange_rate SET rate = ${rate} WHERE from_currency = '${from_currency}' AND to_currency = '${to_currency}'`, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Exchange rate updated' });
    });
});

// User can transfer same cryptocurrency to other. 
// User can transfer cryptocurrency to other with difference currency such ETH to BTC with exchange rate.
//Transfer cryptocurrency
app.post('/transfer', (req, res) => {
    const { from_user_id, to_user_id, amount, from_currency, to_currency } = req.body;
    connection.query(`SELECT amount FROM balances WHERE user_id = ${from_user_id} AND currency = '${from_currency}'`, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        }
        if (results.length === 0 || results[0].amount < amount) {
            res.status(500).json({ error: 'Insufficient balance' });
        }
        // Check rate
        connection.query(`SELECT rate FROM exchange_rate WHERE from_currency = '${from_currency}' AND to_currency = '${to_currency}'`, (err, results) => {
            if (err) {
                res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                res.status(500).json({ error: 'Invalid exchange rate' });
            }
            const rate = results[0].rate;
            // from_user
            connection.query(`UPDATE balances SET amount = amount - ${amount} WHERE user_id = ${from_user_id} AND currency = '${from_currency}'`, (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                }
                // Converted amount to_user
                const convertedAmount = amount * rate;
                connection.query(`UPDATE balances SET amount = amount + ${convertedAmount} WHERE user_id = ${to_user_id} AND currency = '${to_currency}'`, (err) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                    }
                    res.json({ message: 'Transfer successful' });
                });
            });
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));

