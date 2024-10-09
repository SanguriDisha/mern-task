const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const axios = require('axios');

router.get('/initialize', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const products = response.data;

        await Product.deleteMany({});

        await Product.insertMany(products);

        res.status(200).json({ message: 'Database initialized successfully!' });
    } catch (error) {
        console.error('Error fetching or inserting data:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.get('/transactions', async (req, res) => {
    const { month, page = 1, perPage = 10, search = '' } = req.query;

    const monthMap = {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11,
    };

    const monthIndex = monthMap[month] !== undefined ? monthMap[month] : null;

    if (monthIndex === null) {
        return res.status(400).json({ message: 'Invalid month provided' });
    }

    try {
        const query = [
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: "$dateOfSale" }, monthIndex + 1]
                    }
                }
            },
            {
                $match: {
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                    ]
                }
            },
            {
                $skip: (page - 1) * perPage
            },
            {
                $limit: Number(perPage)
            }
        ];

        const totalProducts = await Product.countDocuments({
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, monthIndex + 1]
            },
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ]
        });

        const products = await Product.aggregate(query);

        res.status(200).json({
            total: totalProducts,
            page,
            perPage: Number(perPage),
            products,
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: error.message });
    }
});
router.get('/statistics', async (req, res) => {
    const { month } = req.query;

    const monthMap = {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11,
    };

    const monthIndex = monthMap[month] !== undefined ? monthMap[month] : null;

    if (monthIndex === null) {
        return res.status(400).json({ message: 'Invalid month provided' });
    }

    try {
        const stats = await Product.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: "$dateOfSale" }, monthIndex + 1],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalSaleAmount: { $sum: { $cond: [{ $eq: ["$sold", true] }, "$price", 0] } },
                    totalSoldItems: { $sum: { $cond: [{ $eq: ["$sold", true] }, 1, 0] } },
                    totalNotSoldItems: { $sum: { $cond: [{ $eq: ["$sold", false] }, 1, 0] } },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalSaleAmount: 1,
                    totalSoldItems: 1,
                    totalNotSoldItems: 1,
                },
            },
        ]);

        if (stats.length === 0) {
            return res.status(404).json({ message: 'No data found for the selected month.' });
        }

        res.status(200).json(stats[0]);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/barchart', async (req, res) => {
    const { month } = req.query;

    const monthMap = {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11,
    };

    const monthIndex = monthMap[month] !== undefined ? monthMap[month] : null;

    if (monthIndex === null) {
        return res.status(400).json({ message: 'Invalid month provided' });
    }

    try {
        const priceRanges = [
            { min: 0, max: 100 },
            { min: 101, max: 200 },
            { min: 201, max: 300 },
            { min: 301, max: 400 },
            { min: 401, max: 500 },
            { min: 501, max: 600 },
            { min: 601, max: 700 },
            { min: 701, max: 800 },
            { min: 801, max: 900 },
            { min: 901, max: Infinity },
        ];

        const counts = priceRanges.map(() => 0);

        const products = await Product.find({
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, monthIndex + 1]
            }
        });

        products.forEach(product => {
            const price = product.price;
            for (let i = 0; i < priceRanges.length; i++) {
                if (price >= priceRanges[i].min && price <= priceRanges[i].max) {
                    counts[i]++;
                    break;
                }
            }
        });

        res.status(200).json({
            month,
            priceRanges: counts,
        });
    } catch (error) {
        console.error('Error fetching bar chart data:', error);
        res.status(500).json({ message: error.message });
    }
});
router.get('/categories', async (req, res) => {
    const { month } = req.query;

    const monthMap = {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11,
    };

    const monthIndex = monthMap[month] !== undefined ? monthMap[month] : null;

    if (monthIndex === null) {
        return res.status(400).json({ message: 'Invalid month provided' });
    }

    try {
        const results = await Product.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: "$dateOfSale" }, monthIndex + 1]
                    }
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    count: 1
                }
            }
        ]);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching category statistics:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/combined', async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).json({ message: 'Month is required' });
    }

    const monthMap = {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11,
    };

    const monthIndex = monthMap[month] !== undefined ? monthMap[month] : null;

    if (monthIndex === null) {
        return res.status(400).json({ message: 'Invalid month provided' });
    }

    try {
        const stats = await Product.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: "$dateOfSale" }, monthIndex + 1]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSaleAmount: { $sum: "$price" },
                    totalSoldItems: { $sum: { $cond: [{ $eq: ["$sold", true] }, 1, 0] } },
                    totalNotSoldItems: { $sum: { $cond: [{ $eq: ["$sold", false] }, 1, 0] } }
                }
            }
        ]);

        const totalStats = stats.length ? stats[0] : { totalSaleAmount: 0, totalSoldItems: 0, totalNotSoldItems: 0 };

        const barChartData = await Product.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: "$dateOfSale" }, monthIndex + 1]
                    }
                }
            },
            {
                $bucket: {
                    groupBy: "$price",
                    boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
                    default: "901-above",
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);

        const categoryData = await Product.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: "$dateOfSale" }, monthIndex + 1]
                    }
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    count: 1
                }
            }
        ]);

        const combinedResponse = {
            month,
            statistics: {
                totalSaleAmount: totalStats.totalSaleAmount,
                totalSoldItems: totalStats.totalSoldItems,
                totalNotSoldItems: totalStats.totalNotSoldItems,
            },
            barChart: barChartData,
            categories: categoryData
        };

        res.status(200).json(combinedResponse);
    } catch (error) {
        console.error('Error fetching combined data:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;