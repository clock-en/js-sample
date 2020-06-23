/**
 * validation.js
 * @fileoverview バリデーション機能を管理
 * @requires jQuery
 */

/**
 * formApp
 * @namespace
 */
var formApp = formApp || {};

/**
 * @class バリデーション機能クラス
 * @memberOf formApp
 */
(function ($) {
  function Validation(messages) {
    this.rules = {};
    this.results = {};
    this.$form = null;
    this.options = {};
    this.messages = $.extend(
      {
        text: '「%label%」%rule%ご入力ください',
        select: '「%label%」%rule%選択してください。',
        alphabet: 'は英字で',
        singleAlphabet: 'は半角英字で',
        multiAlphabet: 'は全角英字で',
        number: 'は数字で',
        singleNumber: 'は半角数字で',
        multiNumber: 'は全角数字で',
        integer: 'は半角数字（整数）で',
        email: 'はEメールアドレス形式で'
      },
      messages
    );
  }

  /**
   * バリデーション機能の初期化
   * @method
   * @param {jqObject} $form
   * @param {Object} formModel
   * @param {Object} controllerOptions
   */
  Validation.prototype.initialize = function (
    $form,
    formModel,
    controllerOptions
  ) {
    const self = this;
    if ($form.length === 0 || !formModel || !Object.keys(formModel).length) {
      return false;
    }
    this.$form = $form;
    this.rules = formModel;
    this.options = controllerOptions || {};

    this.results = this.createResultsObject(this.rules);
    this.createErrorElement();

    /* 初期状態のバリデーションを実行 */
    $('[' + this.options.itemDataName + ']').each(function () {
      self.execValidation(this);
    });
    this.updateSubmitState(this.results);

    /* バリデーション結果変更のイベントを設定 */
    this.addValidatedListener();
  };

  /**
   * バリデートの実行
   * @method
   * @param {HTMLElement} target
   */
  Validation.prototype.execValidation = function (target) {
    const util = formApp.Utility;
    const itemDataName = this.options.itemDataName;
    const itemName = $(target).attr(itemDataName);
    let result = null;

    if (this.results[itemName] !== undefined) {
      const rules = this.rules[itemName]['rules'];
      const value = util.getValue(target, itemDataName);
      this.results[itemName] = this.validate(rules, value);
      result = {
        name: itemName,
        status: this.results[itemName]
      };
    }
    return result;
  };

  /**
   * バリデートの実行
   * @method
   * @param {array} rules
   * @param {any} value
   * @param {string} status
   * @return {boolean}
   */
  Validation.prototype.validate = function (rules, value, status) {
    const self = this;
    const util = formApp.Utility;
    let result = false;
    let resultState = 'valid';

    if (!Array.isArray(rules)) {
      return resultState;
    }

    rules.some(function (rule) {
      const methodName = 'validate' + util.convertCamelcase(rule, true);
      if (self[methodName]) {
        switch (rule) {
          case 'notBlank':
          case 'isSeleced':
            result = self[methodName](value);
            break;
          default:
            if (!util.isBlank(value)) {
              result = self[methodName](value);
            } else {
              result = true;
            }
        }
      }
      if (!result) {
        resultState = rule;
        return true;
      }
    });

    return resultState;
  };

  /**
   * バリデートルール：必須チェック
   * @method
   * @param {any} value
   * @return {boolean}
   */
  Validation.prototype.validateNotBlank = function (value) {
    const util = formApp.Utility;
    const result = !util.isBlank(value);

    return result;
  };

  /**
   * バリデートルール：必須チェック（選択項目）
   * @method
   * @param {any} value
   * @return {boolean}
   */
  Validation.prototype.validateIsSeleced = function (value) {
    const util = formApp.Utility;
    const result = !util.isBlank(value);

    return result;
  };

  /**
   * バリデートルール：英字チェック
   * @method
   * @param {String} value
   * @return {Boolean}
   */
  Validation.prototype.validateAlphabet = function (value) {
    let result = false;
    if (typeof value !== 'string') {
      return result;
    }
    const single = this.options.alphabetsPattern;
    const multi = this.options.multiAlphabetsPattern;
    const pattern = new RegExp('^[' + single + multi + ' 　' + ']+$');
    if (value.match(pattern)) {
      result = true;
    }
    return result;
  };

  /**
   * バリデートルール：半角英字チェック
   * @method
   * @param {String} value
   * @return {Boolean}
   */
  Validation.prototype.validateSingleAlphabet = function (value) {
    let result = false;
    if (typeof value !== 'string') {
      return result;
    }
    const single = this.options.alphabetsPattern;
    const pattern = new RegExp('^[' + single + ' 　' + ']+$');
    if (value.match(pattern)) {
      result = true;
    }
    return result;
  };

  /**
   * バリデートルール：全角英字チェック
   * @method
   * @param {String} value
   * @return {Boolean}
   */
  Validation.prototype.validateMultiAlphabet = function (value) {
    let result = false;
    if (typeof value !== 'string') {
      return result;
    }
    const multi = this.options.multiAlphabetsPattern;
    const pattern = new RegExp('^[' + multi + ' 　' + ']+$');
    if (value.match(pattern)) {
      result = true;
    }
    return result;
  };

  /**
   * バリデートルール：数字チェック
   * @method
   * @param {String} value
   * @return {Boolean}
   */
  Validation.prototype.validateNumber = function (value) {
    let result = false;
    if (typeof value !== 'string') {
      return result;
    }
    const single = this.options.numbersPattern;
    const multi = this.options.multiNumbersPattern;
    const pattern = new RegExp('^[' + single + multi + ']+$');
    if (value.match(pattern)) {
      result = true;
    }
    return result;
  };

  /**
   * バリデートルール：半角数字チェック
   * @method
   * @param {String} value
   * @return {Boolean}
   */
  Validation.prototype.validateSingleNumber = function (value) {
    let result = false;
    if (typeof value !== 'string') {
      return result;
    }
    const single = this.options.numbersPattern;
    const pattern = new RegExp('^[' + single + ']+$');
    if (value.match(pattern)) {
      result = true;
    }
    return result;
  };

  /**
   * バリデートルール：全角数字チェック
   * @method
   * @param {String} value
   * @return {Boolean}
   */
  Validation.prototype.validateMultiNumber = function (value) {
    let result = false;
    if (typeof value !== 'string') {
      return result;
    }
    const multi = this.options.multiNumbersPattern;
    const pattern = new RegExp('^[' + multi + ']+$');
    if (value.match(pattern)) {
      result = true;
    }
    return result;
  };

  /**
   * バリデートルール：半角数値（0含む自然数）
   * @method
   * @param {String} value - バリデート対象となるvalue値
   * @return {Boolean}
   */
  Validation.prototype.validateInteger = function (value) {
    let result = false;
    const regExp = new RegExp('^(0|[1-9][0-9]*)$');

    if (value.match(regExp)) {
      result = true;
    }
    return result;
  };

  /**
   * バリデートルール：Eメールアドレス形式
   * @method
   * @param {String} value
   * @return {Boolean}
   */
  Validation.prototype.validateEmail = function (value) {
    let result = false;
    if (typeof value !== 'string') {
      return result;
    }
    const alphabets = this.options.alphabetsPattern;
    const numbers = this.options.numbersPattern;
    const localSymbols =
      "!#\\$%&'\\+\\-\\/=\\?\\^_`\\{\\|\\}~\\\\.\\*"; /*!#$%&'+-/=?^_`{|}~\.**/
    const domainSymbols = '\\-\\.'; /*-.*/
    const pattern = new RegExp(
      '^[' +
        alphabets +
        numbers +
        localSymbols +
        ']+@[' +
        alphabets +
        numbers +
        domainSymbols +
        ']+\\.[' +
        alphabets +
        numbers +
        domainSymbols +
        ']+$'
    );
    if (value.match(pattern)) {
      result = true;
    }
    return result;
  };

  /**
   * バリデーション結果オブジェクトの生成
   * @method
   * @param {Object} obj
   * @return {Object}
   */
  Validation.prototype.createResultsObject = function (obj) {
    const newObj = {};
    const itemDataName = this.options.itemDataName;

    Object.keys(obj).forEach(function (name) {
      /* rulesが設定されいて、要素が存在する場合のみプロパティを設定 */
      if (
        obj[name]['rules'] &&
        $('[' + itemDataName + '="' + name + '"]').length > 0
      ) {
        newObj[name] = false;
      }
    });
    const observable = new formApp.Observable(newObj);
    return observable;
  };

  /**
   * バリデーションイベントの設定
   * @method
   */
  Validation.prototype.addValidatedListener = function () {
    $(this.results).on(
      'prop_change',
      function (e) {
        this.updateSubmitState(e.target);
      }.bind(this)
    );
  };

  /**
   * 送信ステータスの更新
   * @method
   * @param {Object} results
   */
  Validation.prototype.updateSubmitState = function (results) {
    const isInValid = Object.keys(results).some(function (name) {
      return results[name] !== 'valid';
    });

    if (!isInValid) {
      this.$form.find(this.options.button).prop('disabled', false);
    } else {
      this.$form.find(this.options.button).prop('disabled', true);
    }
  };

  /**
   * エラーメッセージ要素の生成
   * @method
   */
  Validation.prototype.createErrorElement = function () {
    const containerDataName = this.options.containerDataName;
    const itemDataName = this.options.itemDataName;
    const errorDataName = this.options.errorDataName;
    const errorVisibilityDataName = this.options.errorVisibilityDataName;

    Object.keys(this.results).forEach(function (name) {
      const $wrapper = $('[' + itemDataName + '="' + name + '"]').closest(
        '[' + containerDataName + '="item"]'
      );
      $wrapper.append(
        '<div class="form-error-message" ' +
          errorDataName +
          '="' +
          name +
          '" ' +
          errorVisibilityDataName +
          '="hidden"><label></label></div>'
      );
    });
  };

  /**
   * エラーメッセージ要素の生成
   * @method
   * @param {Object} results
   */
  Validation.prototype.updateErrorState = function (result) {
    const errorDataName = this.options.errorDataName;
    const errorVisibilityDataName = this.options.errorVisibilityDataName;
    const message = this.fetchErrorMessage(result);
    let errorStatus = 'hidden';

    if (result.status !== 'valid') {
      errorStatus = 'visible';
    }
    $('[' + errorDataName + '="' + result.name + '"]').attr(
      errorVisibilityDataName,
      errorStatus
    );
    $('[' + errorDataName + '="' + result.name + '"]')
      .find('label')
      .html(message);
  };

  /**
   * エラーメッセージの取得
   * @method
   * @param {Object} results
   */
  Validation.prototype.fetchErrorMessage = function (result) {
    let message = '';
    if (result.status === 'valid') {
      return message;
    }
    message = this.messages.text;
    if (result.status === 'isSeleced') {
      message = this.messages.select;
    }
    message = message.replace('%label%', result.label);

    let ruleLabel = 'を';
    if (this.messages[result.status]) {
      ruleLabel = this.messages[result.status];
    }
    message = message.replace('%rule%', ruleLabel);

    return message;
  };

  formApp.Validation = Validation;
})(jQuery);
