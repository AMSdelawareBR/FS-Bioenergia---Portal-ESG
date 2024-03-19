sap.ui.define([
	"br/agr/fs/esgsurvey/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/GroupHeaderListItem",
	"sap/ui/core/routing/History",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"br/agr/fs/esgsurvey/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"		
], function(BaseController, UIComponent, JSONModel, GroupHeaderListItem, History, Device, MessageBox, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("br.agr.fs.esgsurvey.controller.Quiz", {

		formatter: formatter,
		/**
		 * Controller Initialization
		 * @private
		 */
		onInit: function() {
			//this.getRouter().getRoute("detail").attachPatternMatched(this._onDetailMatched, this);
		},

		/**
		 * Filter Quizzes
		 * @param {Event} oEvent Event Data
		 * @public
		 */		
		onFilterQuizzes: function(oEvent){
			let sQuery = oEvent.getSource().getValue()
			let aFilter = [];
			if (sQuery && sQuery.length > 0){
				aFilter.push(new Filter("Descricao", FilterOperator.Contains, sQuery));
			}

			this.getView().byId("idQuizTable").getBinding("items").filter(aFilter)			
		},	

		/**
		 * Route Matched
		 * @param {Event} oEvent Event Data
		 * @private
		 */
		_onDetailMatched: function(oEvent) {

		},

		/**
		 * Question Creation Event
		 * @param {Event} oEvent Event Data
		 * @private
		 */		
		onQuizCreate: function(oEvent){
			this.getRouter().navTo("quizItem", {
				quizId: "NEW",
				quizVersion: "NEW"
			});						
		}				
	});
});