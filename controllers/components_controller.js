/**
 * =====================================
 * DEFINING GROUP API CALLS CONTROLLER
 * =====================================
 * @date created: 27 August 2019
 * @authors: Hasitha Dias and Waqas Rehmani
 *
 * The group_controller is used for defining the functionality of api calls related to groups
 *
 */


const mongoose = require('mongoose');

var Components = mongoose.model('components');

// Function for creating a new group
var createComponents = (req, res) => {
    const body = req.body

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a parameter',
        })
    }

    const component = new Components(body)

    if (!component) {
        return res.status(400).json({ success: false, error: err })
    }

    component
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: component._id,
                message: 'Component created!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Component not created!',
            })
        })
}
var getComponents = async (req, res) => {
   var componentArr=[];
    await Components.find({},'name _id', (err, components) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!components.length) {
            return res
                .status(404)
                .json({ success: false, error: `Components not found` })
        }
        for (var key in components) {
           
            componentArr.push({'value': components[key].name,'label': components[key].name});
        }

        return res.status(200).send(componentArr)
    }).catch(err => console.log(err))
}
module.exports = {
    getComponents,
    createComponents,

}