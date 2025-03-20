import mongoose, { Schema } from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    memberId: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    expenseId: [{
        type: Schema.Types.ObjectId,
        ref: 'Expense'
    }],
    groupProfile: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/166/166258.png'
    },
    coverImage: {
        type: String,
        default: 'https://img.freepik.com/premium-photo/top-view-office-table-desk-workspace-with-calculator-black-pen-laptop-blue_101276-159.jpg?semt=ais_hybrid'
    },
    groupType: [{
        type: Array,
        default: null
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})

groupSchema.statics.getGroupDetail = function (groupIds = []) {
    
    if (groupIds.length === 0) return Promise.resolve([]);

    return this.aggregate([
        {
            $match: {
                _id: {
                    $in: groupIds.map(id => new mongoose.Types.ObjectId(id))
                }
            }
        },
        {
            $project: {
                id: "$_id",
                name: 1,
                groupProfile: 1,
                coverImage: 1,
                memberId: 1
            }
        }
    ])
}

groupSchema.statics.getGroupExpense = function (groupId) {
    return this.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(groupId)
            }
        },
        {
            $lookup: {
                from: 'expenses',
                let: {
                    groupid: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$groupId", "$$groupid"] },
                                    { $ne: ["$isDeleted", true] }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            amount: 1,
                            currency: 1,
                            paidby: 1,
                            splitbtwn: 1,
                            isGroupExpense: 1,
                            groupId: 1,
                            expenseType: 1,
                            expenseImage: 1,
                            groupProfile: 1,
                            coverImage: 1,
                            isDeleted: 1,
                            deletedAt: 1,
                            createdAt: 1
                        }
                    }
                ],
                as: 'groupExpense'
            }
        },
        {
            $unwind: "$groupExpense",
            preserveNullAndEmptyArrays: true
        },
        {
            $project: {
                groupExpense: 1,
                name: 1,
                groupType: 1,
                groupProfile: 1
            }
        }
    ])
}

const Group = mongoose.model('Group', groupSchema)

export default Group