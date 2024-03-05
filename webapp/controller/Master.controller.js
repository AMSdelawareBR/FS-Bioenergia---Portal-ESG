sap.ui.define([
	"br/agr/fs/esgsurvey/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/core/routing/History",
	"sap/ui/Device"
], function(BaseController, UIComponent, JSONModel, Filter, FilterOperator, GroupHeaderListItem, History, Device) {
	"use strict";

	return BaseController.extend("br.agr.fs.esgsurvey.controller.Master", {
		/**
		 * Controller Initialization
		 * @private
		 */
		onInit: function() {
			this.bFirstTime = true;
			this.bFirstSort = true;
			this.bActionDone = false;

            // Routing
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(
				this._onMasterMatched, this);
		},

		/**
		 * Route Matched
		 * @param {Event} oEvent Event Data
		 * @private
		 */
		_onMasterMatched: function(oEvent) {
			this.sRouteName = oEvent.getParameter("name");
			if (this.sRouteName === "master"){
				this.getRouter().navTo("quiz", {}, true);
			}
		},

		handleSelectNavigationListItemQuizRoot: function(oEvent) {
			this.getRouter().navTo("quiz");
		},

		handleSelectNavigationListItemQuizItem: function(oEvent) {
			let aKeyParts = oEvent.getSource().getKey().split("#")
			this.getRouter().navTo("quizItem", {
				quizId: aKeyParts[0],
				quizVersion: aKeyParts[1]
			});
		},

		handleSelectNavigationListItemQuestionRoot: function(oEvent) {
			this.getRouter().navTo("question", {}, true);
		},

		handleSelectNavigationListItemQuestionItem: function(oEvent) {
			let aKeyParts = oEvent.getSource().getKey().split("#")
			this.getRouter().navTo("questionItem", {
				questionId: aKeyParts[0]
			});
		},		
		/**
		 * Handle List Selection
		 * @param {Event} oEvent Item Selected
		 * @public
		 */
		handleListSelect: function(oEvent) {
			if (oEvent.getParameter("listItem")) {
				this._showDetail(oEvent.getParameter("listItem"));
			} else {
				this._showDetail(oEvent.getSource());
			}
		},

		/**
		 * Shows the Item Detail
		 * @param {Object} oItem Item Selected
		 * @private
		 */
		_showDetail: function(oItem) {
			var oItemObject = oItem.getBindingContext().getObject();
			this.getRouter().navTo("detail", {
				origin: oItemObject.SAP__Origin,
				workitem: oItemObject.InstanceID
			});
		},

		/**
		 * Sets the item count on the master list header
		 * @param {integer} iTotalItems the total number of items in the list
		 * @private
		 */
		_updateListItemCount: function(iTotalItems) {
			var sTitle;
			if (this._oList.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
				this.getModel("masterView").setProperty("/title", sTitle);
			}
		}
	});
});