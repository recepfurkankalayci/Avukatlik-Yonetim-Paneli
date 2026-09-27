const { Op } = require('sequelize');

async function generatePublicId(models, prefix) {
    const currentYear = new Date().getFullYear();
    const searchPattern = `${prefix}-${currentYear}-%`;


    const lastRecord = await models.findOne({
        where: { public_id: { [Op.like]: searchPattern } },
        order: [["public_id", "DESC"]]
    });

    let nextSequence = 1;

    if (lastRecord && lastRecord.public_id) {
        const part = lastRecord.public_id.split("-");

        if (part.length === 3) {
            const lastNumber = parseInt(part[2], 10);
            nextSequence = lastNumber + 1;
        }
    }

    const paddedSequence = nextSequence.toString().padStart(6, '0');

    return `${prefix}-${currentYear}-${paddedSequence}`;
}

module.exports = generatePublicId;
