sap.ui.define([
	"br/agr/fs/esgsurvey/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/GroupHeaderListItem",
	"sap/ui/core/routing/History",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"br/agr/fs/esgsurvey/util/Entity",
	'sap/m/Token',
	"sap/m/MessageToast"
], function(BaseController, UIComponent, JSONModel, GroupHeaderListItem, History, Device, MessageBox, Entity, Token, MessageToast) {
	"use strict";

	return BaseController.extend("br.agr.fs.esgsurvey.controller.QuestionItem", {
		/**
		 * Controller Initialization
		 * @private
		 */
		onInit: function() {
			this._formFragments = {};
			this.getRouter().getRoute("questionItem").attachPatternMatched(this._onDetailMatched, this);
		},

		/**
		 * Route Matched
		 * @param {Event} oEvent Event Data
		 * @private
		 */
		_onDetailMatched: function(oEvent) {
			this._initializeQuestionItemData({}, true);
			let sQuestionId = oEvent.getParameter("arguments").questionId;

			this.getModel("questionView").setData({
				edit: true
			})
			this.getModel("questionView").refresh(true)

			var fnValidator = function(args){
				var text = args.text;

				return new Token({key: text, text: text});
			};			

			if (sQuestionId !== "NEW"){
				var sObjectPath = this.getModel().createKey("/ZC_GEN_PERGUNTAS", {
					Pergunta: sQuestionId
				});

				this.setAppBusy(true);
				this.getModel().read(sObjectPath, {
					urlParameters: {
						$expand: "to_Aprovadores,to_Responsa"
					},
					success: function (oQuestionData) {
						
						this.setAppBusy(false);
						this._initializeQuestionEdit(oQuestionData)
					}.bind(this),
					error: function (oError) {}
				});				
			}else{
				this._initializeQuestionItemData({}, true);
				this._showFormFragment("QuestionItemEdit");

				// Inputs
				var oResponsibleInput = this.getView().byId("responsibleinput");
				var oApproverInput = this.getView().byId("approversinput");
				oResponsibleInput.addValidator(fnValidator);
				oApproverInput.addValidator(fnValidator);			
				oResponsibleInput.setTokens([])
				oApproverInput.setTokens([])				
			}					
		},

		_initializeQuestionEdit: function(oQuestionData){
			
			this._initializeQuestionItemData(oQuestionData, false);
			this._showFormFragment("QuestionItemEdit");

			var fnValidator = function(args){
				var text = args.text;

				return new Token({key: text, text: text});
			};		

			// Inputs
			let oResponsibleInput = this.getView().byId("responsibleinput");
			let oApproverInput = this.getView().byId("approversinput");		
			
			oResponsibleInput.setTokens(oQuestionData.to_Responsa.results.map(responsible => ( new Token( { text: responsible.Email, key: responsible.Email } ) ) ) )
			oApproverInput.setTokens(oQuestionData.to_Aprovadores.results.map(responsible => ( new Token( { text: responsible.Email, key: responsible.Email } ) ) ) )

			oResponsibleInput.addValidator(fnValidator);
			oApproverInput.addValidator(fnValidator);			
		},

		/**
		 * Initialize Question Item
		 * @param {JSONObject} oQuestionItem Question Data
		 * @private
		 */
		_initializeQuestionItemData: function (oQuestionItem, bNewQuestion) {
			// Base Build			
			var oQuestionItemBase = {}

			// Info Parsing
			if (!bNewQuestion){				
				oQuestionItemBase = Entity.buildQuestion(bNewQuestion);
				this._moveCorrespondingAttributes("ZC_GEN_PERGUNTASType", oQuestionItem, oQuestionItemBase); // Solicitation				
			}else{
				oQuestionItemBase = Entity.buildQuestion(bNewQuestion);
			}

			// Model
			this.getModel("questionEdit").setData(
				oQuestionItemBase
			);			
			this.getModel("questionEdit").refresh(true)
		},

		/**
		 * Save Question
		 * @public
		 * @param {Object} oEvent Event 
		 * @returns {sap.ui.core.FragmentDefinition} The Fragment Definition
		 */	
		onSelectPillar: function(oEvent){
			// Model 
			let questionEdit = this.getModel("questionEdit").getData()			
			questionEdit.Pilar = oEvent.getSource().getSelectedKey()
			this.getModel("questionEdit").setData(questionEdit)
			this.getModel("questionEdit").refresh(true)
		},

		/**
		 * Save Question
		 * @public
		 * @param {String} sFragmentName Fragment Name
		 * @returns {sap.ui.core.FragmentDefinition} The Fragment Definition
		 */		
		onSaveQuestionItem: function(oEvent){
						
			// Inputs
			let aResponsibles = this.getView().byId("responsibleinput").getTokens();
			let aApprovers = this.getView().byId("approversinput").getTokens();			

			// Model 
			let questionEdit = this.getModel("questionEdit").getData()

			// OData Creation
			let questionData = {
				Pergunta: questionEdit.Pergunta,
				Enunciado: questionEdit.Enunciado,
				Descricao: questionEdit.Descricao,
				DataInicio: questionEdit.DataInicio,
				DataFim: questionEdit.DataFim,
				Pilar: questionEdit.Pilar,
				Status: questionEdit.Status,
				to_Aprovadores: aApprovers.map(approver => ({
					Email: approver.getKey( )
				})),
				to_Responsa: aResponsibles.map(responsible => ({
					Email: responsible.getKey( )
				}))
			}

			
			this.setAppBusy(true)
			this.getModel().create("/ZC_GEN_PERGUNTAS", questionData, {
				success: function (oData) {
					this.setAppBusy(false);
					MessageToast.show(this.getResourceBundle().getText("questionCreateSuccess"));
					this.getRouter().navTo("question");					
				}.bind(this),
				error: function (oError) {
					
					this.setAppBusy(false);
					/*
					sap.m.MessageBox.error(this.getResourceBundle().getText("notificationError"));
					*/
				}.bind(this)
			});
		},

		/**
		 * Move Corresponding
		 * @param {String} sEntityName Entity Name
		 * @param {JSONObject} oBaseFrom Object Base
		 * @param {JSONObject} oBaseTo Object Destiny
		 * @private
		 */
		_moveCorrespondingAttributes: function (sEntityName, oBaseFrom, oBaseTo) {
			var oMaintenanceMetadata = this.getView().getModel().getServiceMetadata().dataServices.schema[0].entityType.find(
				function (oEntity) {
					return oEntity.name === sEntityName;
				});

			oMaintenanceMetadata.property.forEach(function (oProperty) {
				if (oBaseFrom.hasOwnProperty(oProperty.name) && oBaseFrom[oProperty.name]) {
					oBaseTo[oProperty.name] = oBaseFrom[oProperty.name];
				}
			});
		},

		/**
		 * Get the Form Fragment
		 * @public
		 * @param {String} sFragmentName Fragment Name
		 * @returns {sap.ui.core.FragmentDefinition} The Fragment Definition
		 */
		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "br.agr.fs.esgsurvey.view.fragments." + sFragmentName, this);

			this._formFragments[sFragmentName] = oFormFragment;
			return this._formFragments[sFragmentName];
		},

		/**
		 * Show the Form Fragment
		 * @public
		 * @param {String} sFragmentName Fragment Name
		 */
		_showFormFragment: function (sFragmentName) {
			var oPage = this.byId("questionItem");
			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		}		
	});
});