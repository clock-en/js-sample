/**
 * default.js
 * @fileoverview フォーム起動
 * @requires jQuery
 */

/**
 * formApp
 * @namespace
 */
var formApp = formApp || {};

$(function () {
  const pageType = $('[data-flow]').attr('data-flow');
  const formAppId = 'default';

  switch (pageType) {
    case 'input':
      /**
       * Validationインスタンスの生成
       * 独自のバリデーションを追加したい場合はメッセージルールを追加し、
       * 「validation」+「バリデーション名」で関数を設定する。
       */
      const formAppValidation = new formApp.Validation({
        isHoge: 'は「hoge」と'
      });
      /* 入力値がhogeの場合にtrueとする */
      formAppValidation.validateIsHoge = function (value) {
        return value === 'hoge';
      };

      /**
       * Controllerインスタンスの生成
       * 引数にフォームのID, フォームアイテムの情報, バリデーションインスタンスを
       * 設定して処理を起動する
       */
      const formAppController = new formApp.Controller(
        formAppId,
        {
          name: {
            label: '氏名',
            rules: ['notBlank'],
            filters: ['trim']
          },
          kana: {
            label: 'フリガナ',
            rules: ['notBlank'],
            filters: ['trim']
          },
          alphabet: {
            label: '英字のみ（全半角）',
            rules: ['notBlank', 'alphabet'],
            filters: ['trim']
          },
          alphabet_single: {
            label: '英字のみ（半角）',
            rules: ['notBlank', 'singleAlphabet'],
            filters: ['trim']
          },
          alphabet_multi: {
            label: '英字のみ（全角）',
            rules: ['notBlank', 'multiAlphabet'],
            filters: ['trim']
          },
          number: {
            label: '数字のみ（全半角）',
            rules: ['notBlank', 'number'],
            filters: ['trim']
          },
          number_single: {
            label: '数字のみ（半角）',
            rules: ['notBlank', 'singleNumber'],
            filters: ['trim']
          },
          number_multi: {
            label: '数字のみ（全角）',
            rules: ['notBlank', 'multiNumber'],
            filters: ['trim']
          },
          integer: {
            label: '0含む自然数のみ',
            rules: ['notBlank', 'integer'],
            filters: ['trim']
          },
          email: {
            label: 'E-Mail',
            rules: ['notBlank', 'email'],
            filters: ['trim']
          },
          has_initial: {
            label: '初期値あり',
            rules: ['notBlank'],
            filters: ['trim']
          },
          optional: {
            label: '任意項目',
            filters: ['trim']
          },
          checkbox: {
            label: 'チェックボックス',
            rules: ['isSeleced']
          },
          radio: {
            label: 'ラジオボタン',
            rules: ['isSeleced']
          },
          hoge: {
            label: '独自hoge入力欄',
            rules: ['isHoge'],
            filters: ['trim']
          }
        },
        formAppValidation
      );

      formAppController.bootInput();
    default:
      break;
  }
});
