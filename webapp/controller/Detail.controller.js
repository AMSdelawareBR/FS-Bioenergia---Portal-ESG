sap.ui.define([
	"br/agr/fs/esgsurvey/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/GroupHeaderListItem",
	"sap/ui/core/routing/History",
	"sap/ui/Device",
	"sap/m/MessageBox"
], function(BaseController, UIComponent, JSONModel, GroupHeaderListItem, History, Device, MessageBox) {
	"use strict";

	return BaseController.extend("br.agr.fs.esgsurvey.controller.Detail", {
		/**
		 * Controller Initialization
		 * @private
		 */
		onInit: function() {
			//this.getRouter().getRoute("detail").attachPatternMatched(this._onDetailMatched, this);
		},

		/**
		 * Route Matched
		 * @param {Event} oEvent Event Data
		 * @private
		 */
		_onDetailMatched: function(oEvent) {

		}
	});
});