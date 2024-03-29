/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";

	return Controller.extend("br.agr.fs.esgsurvey.controller.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Find the Split App
		 * @public
		 * @param {Control} oControl Base Control
		 * @returns {Control} The Split App Contorl
		 */
		_findSplitApp: function(oControl) {
			var sAncestorControlName = "idAppControl";

			if (oControl instanceof sap.ui.core.mvc.View && oControl.byId(sAncestorControlName)) {
				return oControl.byId(sAncestorControlName);
			}

			return oControl.getParent() ? this._findSplitApp(oControl.getParent(), sAncestorControlName) : null;
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function() {
			const oHistory = History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("master", {}, true);
			}
		},

		/**
		 * Sets Busy App
		 * @public
		 * @param {boolean} bBusy App State
		 */
		setAppBusy: function (bBusy) {
			this.getModel("appView").setProperty("/busy", bBusy);
			this.getModel("appView").refresh(true);
		}		

	});

});