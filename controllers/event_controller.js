/**
 * =====================================
 * DEFINING EVENT API CALLS CONTROLLER
 * =====================================
 * @date created: 25 August 2019
 * @authors: Jay Parikh and Uvin Abeysinghe
 *
 * The event_controller is used for defining the functionality of api calls related to events
 *
 */

const mongoose = require('mongoose');

const path = require('path');
var formidable = require('formidable');
const { Storage } = require('@google-cloud/storage');
const googleConfig = require(path.join(__dirname, '..', 'config/keys')).google;
const mime = require('mime-types');

// defines the google bucket storage space for pictures and files
const storage = new Storage({
    projectId: googleConfig.projectId,
    keyFilename: './config/Coaching Mate Social Website-49227c7ec05e.json',
});

var Event = mongoose.model('events');

// Function for creating a new event
var createEvent = function (req, res) {
    var newEvent = new Event({
        eventId: req.body.eventId,
        name: req.body.name,
        owner: req.body.owner,
        groupEvent: req.body.groupEvent,
        eventType: req.body.eventType,
        time: req.body.time,
        eventAsset: '',
        eventAssetFileName: '',
        location: {
            lat: req.body.location.lat,
            lng: req.body.location.lng,
        },
        description: req.body.description,
        attending: req.body.attending,
        interested: req.body.interested,
    });

    newEvent.save(function (err, createdEvent) {
        if (!err) {
            res.send(createdEvent);
        } else {
            console.log(err);
            res.send(err);
        }
    });
};

// Function for getting all stored in the DB
var getAllEvents = function (req, res) {
    Event.find(function (err, allEvent) {
        if (!err) {
            res.send(allEvent);
        } else {
            res.send(err);
        }
    });
};

// Function to get all events the are connected to a particular group
var getEventByGroup = function (req, res) {
    let groupId = req.params.groupId;

    Event.find({ groupEvent: groupId }, function (err, events) {
        if (!err) {
            res.send(events);
        } else {
            res.send(err);
        }
    });
};

// Function to get an event that has a particular eventId passed into req
var getEvent = function (req, res) {
    let eventId = req.params.eventId;

    Event.findOne({ eventId }, function (err, event) {
        if (!err) {
            res.send(event);
        } else {
            res.send(err);
        }
    });
};

// Function to change 'interested' and 'attending' array of an event with a particular eventId
var editEventResponse = async (req, res) => {
    await Event.findById(req.params.eventId)
        .then((event) => {
            event.interested = req.body.interested;
            event.attending = req.body.attending;

            event
                .save()
                .then(() =>
                    res.json({ success: true, msg: 'Event Response updated!' })
                )
                .catch((err) => {
                    res.json({ success: false, msg: 'Error: ' + err });
                });
        })
        .catch((err) => {
            res.json({ success: false, msg: 'Error: ' + err });
        });
};

// Function to edit an event with a particular eventId
var editEvent = async (req, res) => {
    await Event.findById(req.params.eventId)
        .then((event) => {
            event.name = req.body.name;
            event.time = req.body.time;
            event.eventType = req.body.eventType;
            event.location.lat = req.body.location.lat;
            event.location.lng = req.body.location.lng;
            event.description = req.body.description;

            event
                .save()
                .then(() => res.json({ success: true, msg: 'Event updated!' }))
                .catch((err) => {
                    res.json({ success: false, msg: 'Error: ' + err });
                });
        })
        .catch((err) => {
            res.json({ success: false, msg: 'Error: ' + err });
        });
};

// Function to update the cover picture of an event with the given eventId
var updateCover = function (req, res) {
    let eventId = req.params.eventId;

    var form = new formidable.IncomingForm();
    const bucket = storage.bucket(googleConfig.eventBucket);

    form.parse(req, function (err, fields, files) {
        let filetoupload = files.file;

        Event.findOne({ eventId }, (err, event) => {
            if (!err) {
                if (filetoupload) {
                    let type = mime.lookup(filetoupload.name);
                    let newName =
                        eventId + '_cover.' + mime.extensions[type][0];

                    // if a cover picture already exists, then first delete it and upload the new one
                    if (event.eventAssetFileName !== '') {
                        bucket
                            .file(event.eventAssetFileName)
                            .delete()
                            .then(() => {
                                bucket.upload(
                                    filetoupload.path,
                                    {
                                        gzip: true,
                                        destination: newName,
                                        predefinedAcl: 'publicRead',
                                        metadata: {
                                            contentType: type,
                                        },
                                    },
                                    () => {
                                        bucket
                                            .file(newName)
                                            .getMetadata()
                                            .then((data) => {
                                                Event.findOneAndUpdate(
                                                    { eventId: eventId },
                                                    {
                                                        eventAsset:
                                                            data[0].mediaLink,
                                                        eventAssetFileName: newName,
                                                    },
                                                    function (err, editedUser) {
                                                        if (!err) {
                                                            res.send(
                                                                'Update success.'
                                                            );
                                                        } else {
                                                            console.log(err);
                                                            res.send(err);
                                                        }
                                                    }
                                                );
                                            });
                                    }
                                );
                            });
                    } else {
                        bucket.upload(
                            filetoupload.path,
                            {
                                gzip: true,
                                destination: newName,
                                predefinedAcl: 'publicRead',
                                metadata: {
                                    contentType: type,
                                },
                            },
                            () => {
                                bucket
                                    .file(newName)
                                    .getMetadata()
                                    .then((data) => {
                                        Event.findOneAndUpdate(
                                            { eventId: eventId },
                                            {
                                                eventAsset: data[0].mediaLink,
                                                eventAssetFileName: newName,
                                            },
                                            function (err, editedUser) {
                                                if (!err) {
                                                    res.send('Upload success.');
                                                } else {
                                                    console.log(err);
                                                    res.send(err);
                                                }
                                            }
                                        );
                                    });
                            }
                        );
                    }
                } else {
                    // if there is no fileToUpload then delete the existing cover picture
                    if (event.eventAssetFileName !== '') {
                        bucket
                            .file(event.eventAssetFileName)
                            .delete()
                            .then(() => {
                                Event.findOneAndUpdate(
                                    { eventId: eventId },
                                    { eventAsset: '', eventAssetFileName: '' },
                                    function (err, editedUser) {
                                        if (!err) {
                                            res.send('Delete success.');
                                        } else {
                                            console.log(err);
                                            res.send(err);
                                        }
                                    }
                                );
                            });
                    } else {
                        res.send(false);
                    }
                }
            } else {
                res.send(err);
            }
        });
    });
};

// Function to delete event by eventId (passed in params)
var deleteEvent = function (req, res) {
    let eventId = req.params.eventId;

    Event.findOneAndDelete({ eventId }, function (err, deletedEvent) {
        if (!err) {
            res.send(deletedEvent);
        } else {
            res.send(err);
        }
    });
};

module.exports.createEvent = createEvent;
module.exports.getAllEvents = getAllEvents;
module.exports.getEvent = getEvent;
module.exports.editEventResponse = editEventResponse;
module.exports.getEventByGroup = getEventByGroup;
module.exports.editEvent = editEvent;
module.exports.updateCover = updateCover;
module.exports.deleteEvent = deleteEvent;
