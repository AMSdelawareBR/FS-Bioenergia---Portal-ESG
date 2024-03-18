sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {
		/**
		 * Build Question Entity
		 * @public
		 * @returns {Object} Object Definition
		 */
		buildQuestion: function (bNewItem) {
			var oQuestion = {
				Pergunta: "",
				Enunciado: "",
				Descricao: "",
				DataInicio: new Date(),
                DataFim: new Date(),
				Pilar: "",
				Status: "",
				_Aprovadores: [],
				_Resp: [],
				NewItem: bNewItem
			};
			return oQuestion;
		}
    };
});