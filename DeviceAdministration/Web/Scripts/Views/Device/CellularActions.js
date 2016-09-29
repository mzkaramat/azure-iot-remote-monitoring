﻿/**
 * IoTApp.CellularActions module that is used in the device information secion of the solution 
 */
IoTApp.createModule("IoTApp.CellularActions", function () {
    "use strict";
    /*
     * Module variable initialization
     */
    var self = this;
    self.ActionRequestEndpoint = "/Device/CellularActionRequest";
    self.deviceId = null;
    self.initialCellActionSettings = null;
    self.actionTypes = {
        updateStatus: "UpdateStatus",
        updateSubscriptionPackage: "UpdateSubscriptionPackage",
        reconnectDevice: "ReconnectDevice",
        sendSms: "SendSms"
    }
    self.htmlElementIds = {
        simStateSelect: "#simStateSelect",
        subscriptionPackageSelect: "#subscriptionPackageSelect",
        reconnectDevice: "#reconnectDevice",
        saveActions: "#saveActions",
        editActions: "#editActions",
        sendSms: "#sendSms",
        sendSmsTextBox: "#sendSmsTextBox",
        loadingElement: "#loadingElement",
        cellularActionResultMessage: "#cellularActionResultMessage"
    }
    $.ajaxSetup({ cache: false });

    /*
     * API
     */

    /**
     * Post to the cellular actions request endpoint
     * @param {object} data A CellularActionRequestModel
     * @returns {Promise} A Promise that resolves/rejects on the api request
     */
    var postActionRequest = function (data) {
        return $.post(self.ActionRequestEndpoint, data);
    }

    /*
     * Utility functions
     */

    /**
     * Toggle the actions for to between enabled and disabled
     * @param {boolean} disabled If true disables the form. If false enables the form.
     * @returns {void}
     */
    var toggleInputDisabledProperty = function (disabled) {
        if (disabled) {
            $(self.htmlElementIds.simStateSelect).attr("disabled", "disabled");
            $(self.htmlElementIds.subscriptionPackageSelect).attr("disabled", "disabled");
            $(self.htmlElementIds.reconnectDevice).attr("disabled", "disabled");
            $(self.htmlElementIds.sendSms).attr("disabled", "disabled");
            $(self.htmlElementIds.sendSmsTextBox).attr("disabled", "disabled");
            $(self.htmlElementIds.saveActions).attr("disabled", "disabled");
            $(self.htmlElementIds.editActions).removeAttr("disabled");
        } else {
            $(self.htmlElementIds.simStateSelect).removeAttr("disabled");
            $(self.htmlElementIds.subscriptionPackageSelect).removeAttr("disabled");
            $(self.htmlElementIds.reconnectDevice).removeAttr("disabled");
            $(self.htmlElementIds.sendSms).removeAttr("disabled");
            $(self.htmlElementIds.sendSmsTextBox).removeAttr("disabled");
            $(self.htmlElementIds.saveActions).removeAttr("disabled");
            $(self.htmlElementIds.editActions).attr("disabled", "disabled");
        }
    }

    /**
     * Retrieves the relevant form values for the cellular actions and 
     * returns it as an object
     * @returns {object} Object that represents the values in the form. 
     */
    var retrieveActionFormValues = function () {
        var simStatus = $(self.htmlElementIds.simStateSelect).val();
        var subscriptionPackage = $(self.htmlElementIds.subscriptionPackageSelect).val();
        return {
            subscriptionPackage: subscriptionPackage,
            simStatus: simStatus
        }
    }

    /**
     * Generate an CellularActionRequestModel object from the form inputs. Used
     * to send to the CellularActionUpdateRequest api end point.
     * @returns {object} The CellularActionRequestModel
     */
    var generateActionUpdateRequestFromInputs = function () {
        var cellularCellularActionRequestModel = {
            cellularActions: []
        };
        var currentFormValues = retrieveActionFormValues();
        if (currentFormValues.subscriptionPackage !== self.initialCellActionSettings.subscriptionPackage) {
            cellularCellularActionRequestModel.cellularActions.push({
                type: self.actionTypes.updateSubscriptionPackage,
                previousValue: self.initialCellActionSettings.subscriptionPackage,
                value: currentFormValues.subscriptionPackage
            });
        }
        if (currentFormValues.simStatus !== self.initialCellActionSettings.simStatus) {
            cellularCellularActionRequestModel.cellularActions.push({
                type: self.actionTypes.updateStatus,
                previousValue: self.initialCellActionSettings.simStatus,
                value: currentFormValues.simStatus
            });
        }
        cellularCellularActionRequestModel.deviceId = self.deviceId;
        return cellularCellularActionRequestModel;
    }

    /**
     * Generate an CellularActionRequestModel from an action type string.
     * @param {string} type : string representing the action type
     * @param {any} value : string representing the value to pass with the action if any.
     * @returns {object} The CellularActionRequestModel
     */
    var generateActionUpdateRequestFromType = function (type, value) {
        var cellularCellularActionRequestModel = {
            deviceId: self.deviceId,
            cellularActions: []
        };
        switch (type) {
            case self.actionTypes.reconnectDevice:
                {
                    cellularCellularActionRequestModel.cellularActions.push({
                        type: self.actionTypes.reconnectDevice,
                        value: value ? value : null
                    });
                    break;
                }
            case self.actionTypes.sendSms:
                {
                    cellularCellularActionRequestModel.cellularActions.push({
                        type: self.actionTypes.sendSms,
                        value: value ? value : null
                    });
                    break;
                }
            default:
                {
                    break;
                }
        }
        return cellularCellularActionRequestModel;
    }

    var toggleLoadingElement = function (visible) {
        if (visible) {
            $(self.htmlElementIds.loadingElement).show();
        } else {
            $(self.htmlElementIds.loadingElement).hide();
        }
    }

    /**
     * Generic function for post action request success. Will reload the cellular information details.
     * @param {any} data the data returned by the api
     * @returns {any} returns the data passed in so you can chain to another function with .then()
     */
    var onActionRequestSuccess = function (data) {
        IoTApp.DeviceDetails.getCellularDetailsView()
            .then(function () {
                console.log("done");
            });
        return data;
    }

    /**
     * Generic function for post action request error
     * @param {any} error The error returned from the api
     * @returns {void} 
     */
    var onActionRequestError = function (error) {
        toggleLoadingElement(false);
        console.error(error);
    }

    /*
     * Event Handlers and event handler registration
     */

    /**
     * Callback for the action form save button.
     * @returns {Promise} The promise returned from posting to the api
     */
    var saveActionsOnClick = function () {
        toggleLoadingElement(true);
        var requestModel = generateActionUpdateRequestFromInputs();
        return postActionRequest(requestModel).then(onActionRequestSuccess, onActionRequestError);
    }

    /**
     * Callback for the reconnect device button
     *  @returns {Promise} The promise returned from posting to the api
     */
    var reconnectDeviceOnClick = function () {
        toggleLoadingElement(true);
        var requestModel = generateActionUpdateRequestFromType(self.actionTypes.reconnectDevice);
        return postActionRequest(requestModel)
            .then(onActionRequestSuccess, onActionRequestError);
    }

    /**
     * Callback for the send sms button
     *  @returns {Promise} The promise returned from posting to the api
     */
    var sendSmsOnClick = function () {
        toggleLoadingElement(true);
        var smsText = $(self.htmlElementIds.sendSmsTextBox).val();
        var requestModel = generateActionUpdateRequestFromType(self.actionTypes.sendSms, smsText);
        return postActionRequest(requestModel).then(onActionRequestSuccess, onActionRequestError);
    }

    /**
     * Callback for the edit button on the actions form
     * @returns {void}
     */
    var editActionsOnClick = function () {
        toggleInputDisabledProperty(false);
    }
    var attachEventHandlers = function () {
        $(self.htmlElementIds.editActions).click(editActionsOnClick);
        $(self.htmlElementIds.saveActions).click(saveActionsOnClick);
        $(self.htmlElementIds.sendSms).click(sendSmsOnClick);
        $(self.htmlElementIds.reconnectDevice).click(reconnectDeviceOnClick);
    }

    /*
    * Initialization
    */
    var initActionForm = function () {
        if (!self.deviceId) throw new Error("You must call IoTApp.CellularActions.init(deviceId) with a valid device ID first.");
        self.initialCellActionSettings = retrieveActionFormValues();
        toggleInputDisabledProperty(true);
        attachEventHandlers();
    }
    var init = function () {
        var deviceId = IoTApp.Helpers.DeviceIdState.getDeviceIdFromCookie();
        if (deviceId) {
            self.deviceId = IoTApp.Helpers.DeviceIdState.getDeviceIdFromCookie();
        }
    }
    return {
        init: init,
        initActionForm: initActionForm
    }
}, [jQuery, resources]);
