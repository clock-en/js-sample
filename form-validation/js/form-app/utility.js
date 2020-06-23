/**
 * utility.js
 * @fileoverview フォームの汎用クラスを定義
 * @requires jQuery
 */

/**
 * formApp
 * @namespace
 */
var formApp = formApp || {};

/**
 * @class 汎用静的メソッド
 * @memberOf formApp
 */
(function ($) {
  const Utility = {
    /**
     * フォームアイテム別にvalue値を取得
     * @method
     * @param {HTMLElement} target
     * @return {any}
     */
    getValue: function (target, itemDataName) {
      let value = null;
      const itemName = $(target).attr(itemDataName);
      const type = $(target).attr('type');

      switch (type) {
        case 'checkbox':
        case 'radio':
          value = [];
          $('[' + itemDataName + '="' + itemName + '"]:checked').each(
            function () {
              value.push($(this).val());
            }
          );
          break;
        default:
          value = $(target).val();
          break;
      }
      return value;
    },

    /**
     * 文字列をキャメルケースに変換
     * @param {string} str
     * @param {boolean} upper
     * @return {string}
     */
    convertCamelcase: function (str, upper) {
      if (!str) {
        return str;
      }
      const strs = str.split(/[-_ ]+/);
      let converted = '';

      strs.forEach(function (current, i) {
        converted += current.replace(/^[a-zA-Z]/, function (value) {
          if (i === 0 && !upper) {
            return value.toLowerCase();
          }
          return value.toUpperCase();
        });
      });
      return converted;
    },

    /**
     * 日付が存在するかを判定してBooleanを返す
     * @param {any} day
     * @return {boolean}
     */
    isBlank: function (value) {
      let result = false;
      if (typeof value === 'string' || Array.isArray(value)) {
        if (value.length === 0) {
          result = true;
        }
      }
      return result;
    },

    /**
     * 日付が存在するかを判定してBooleanを返す
     * @param {number} year
     * @param {number} month
     * @param {number} day
     * @return {boolean}
     */
    isDateExist: function (year, month, day) {
      const filteredDate = new Date(year, month - 1, day);
      const filteredMonth = filteredDate.getMonth() + 1;

      if (month === filteredMonth) {
        return true;
      }
      return false;
    },

    /**
     * 未来の日付（明日以降）かを判定してBooleanを返す
     * @param {number} year
     * @param {number} month
     * @param {number} day
     * @return {boolean}
     */
    isFuture: function (year, month, day) {
      const date = new Date(year, month - 1, day);
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();
      /* dateと同じ形式で今日の日付を再取得 */
      const currentDate = new Date(currentYear, currentMonth - 1, currentDay);

      if (date.valueOf() > currentDate.valueOf()) {
        return true;
      }
      return false;
    },

    /**
     * 過去の日付かを判定してBooleanを返す（本日は含めない）
     * @param {number} year
     * @param {number} month
     * @param {number} day
     * @return {boolean}
     */
    isPast: function (year, month, day) {
      const date = new Date(year, month - 1, day);
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();
      /* dateと同じ形式で今日の日付を再取得 */
      const currentDate = new Date(currentYear, currentMonth - 1, currentDay);

      if (date.valueOf() < currentDate.valueOf()) {
        return true;
      }
      return false;
    }
  };

  formApp.Utility = Utility;
})(jQuery);

/**
 * @class 監視オブジェクトクラス
 * @memberOf formApp
 */
(function ($) {
  function Observable(obj) {
    if (obj == null) {
      return;
    }
    for (const key in obj) {
      Object.defineProperty(this, key, _createDescriptor(key, obj[key]));
    }
  }

  function _createDescriptor(key, value) {
    let _value = value;
    return {
      get: function () {
        return _value;
      },
      set: function (v) {
        if (_value === v) return;
        _value = v;
        $(this).trigger('prop_change', [key, v]);
      },
      enumerable: true,
      configurable: true
    };
  }
  formApp.Observable = Observable;
})(jQuery);
