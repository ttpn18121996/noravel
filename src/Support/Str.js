class Str {
  #value;
  constructor(value = '') {
    this.#value = this.caseString(value);
  }

  /**
   * Tìm kiếm 1 chuỗi trong 1 chuỗi cho trước sau đó lấy giá trị sau chuỗi đầu tiên tìm được.
   * @param {string} subject Chuỗi cần phân tích
   * @param {string} search Chuỗi dùng để kiểm tra
   * @return this
   */
  after(search) {
    if (this.#value === '') {
      return this.#value;
    }
    this.#value = this.#value
      .split(search)
      .filter((w, pos) => {
        return pos > 0;
      })
      .join(search);
    return this;
  }

  /**
   * Tìm kiếm 1 chuỗi trong 1 chuỗi cho trước sau đó lấy giá trị sau chuỗi cuối cùng tìm được.
   * @param {string} subject Chuỗi cần phân tích
   * @param {string} search Chuỗi dùng để kiểm tra
   * @return this
   */
  afterLast(search) {
    if (this.#value === '') {
      return this.#value;
    }
    this.#value = this.#value.split(search).reverse()[0];
    return this;
  }

  /**
   * Tìm kiếm 1 chuỗi trong 1 chuỗi cho trước sau đó lấy giá trị trước chuỗi đầu tiên tìm được.
   * @param {string} subject Chuỗi cần phân tích
   * @param {string} search Chuỗi dùng để kiểm tra
   * @return this
   */
  before(search) {
    if (this.#value === '') {
      return this.#value;
    }
    this.#value = this.#value.split(search, 1).join('');
    return this;
  }

  /**
   * Tìm kiếm 1 chuỗi trong 1 chuỗi cho trước sau đó lấy giá trị trước chuỗi cuối cùng tìm được.
   * @param {string} subject Chuỗi cần phân tích
   * @param {string} search Chuỗi dùng để kiểm tra
   * @return this
   */
  beforeLast(search) {
    if (this.#value === '') {
      return this.#value;
    }
    const words = this.#value.split(search);
    this.#value = words
      .filter((w, pos) => {
        return pos < words.length - 1;
      })
      .join(search);
    return this;
  }

  between(start, end) {
    this.afterLast(start).before(end);

    return this;
  }

  bind() {
    const args = arguments;
    let valueBound = this.#value;

    if (Array.isArray(args?.[0])) {
      for (let i = 0; i < args[0].length; i++) {
        valueBound = valueBound.replace(/\{(\d+)\}/, args[0][i]);
      }
    } else {
      valueBound = valueBound.replace(/{(\d+)}/g, (match, number) =>
        typeof args[number] != 'undefined' ? args[number] : match
      );
    }

    this.#value = valueBound;

    return this;
  }

  /**
   * Chèn chuỗi/các chuỗi vào sau giá trị hiện tại.
   * @param {string[]} value Các chuỗi cần chèn
   * @return this
   */
  append(...values) {
    this.#value += values.join('');
    return this;
  }

  /**
   * Chèn chuỗi/các chuỗi vào trước giá trị hiện tại.
   * @param {string[]} value Các chuỗi cần chèn
   * @return this
   */
  prepend(...values) {
    this.#value = values.join('') + this.#value;
    return this;
  }

  camel() {
    this.#value = this.studly()
      .get()
      .replace(/^(.)/, (match, p1) => p1.toLowerCase());
    return this;
  }

  /**
   * Chuyển 1 chuỗi thành dạng kebab => chuyen-1-chuoi-thanh-dang-kebab.
   * @param {string} value Chuỗi cần chyển sang kebab
   * @return this
   */
  kebab() {
    this.snake('-');
    return this;
  }

  lower() {
    this.#value = this.#value.toLowerCase();
    return this;
  }

  snake(delimiter = '_') {
    this.#value = this.nonUnicode(this.#value)
      .lower()
      .get()
      .replace(/[^\w \-]+/g, '')
      .replace(/[\-_\.]+/g, ' ')
      .replace(/[\s]+/g, delimiter);
    return this;
  }

  studly() {
    this.#value = this.title().get().replace(/\s/g, '');
    return this;
  }

  title() {
    this.#value = this.#value
      .replace(/[\s\-_\.]+/g, ' ')
      .replace(/[a-zA-Z0-9]+[\S\-_]*/g, match => match.charAt(0).toUpperCase() + match.substr(1).toLowerCase());
    return this;
  }

  upper() {
    this.#value = this.#value.toUpperCase();
    return this;
  }

  nonUnicode() {
    this.#value = this.#value
      .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
      .replace(/Á|À|Ả|Ạ|Ã|Ă|Ắ|Ằ|Ẳ|Ẵ|Ặ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ/gi, 'A')
      .replace(/đ/gi, 'd')
      .replace(/Đ/gi, 'D')
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
      .replace(/E|É|È|Ẻ|Ẽ|Ê|Ế|Ề|Ể|Ễ|Ệ/gi, 'E')
      .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
      .replace(/I|Í|Ì|Ỉ|Ĩ|Ị/gi, 'I')
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
      .replace(/Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|Ỡ|Ợ/gi, 'O')
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
      .replace(/Ú|Ù|Ủ|Ũ|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự/gi, 'U')
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
      .replace(/Ý|Ỳ|Ỷ|Ỹ|Ỵ/gi, 'Y');
    return this;
  }

  escapeHtml() {
    this.#value = this.#value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    return this;
  }

  limit(length = 100) {
    if (this.#value.length <= length) {
      return this;
    }
    let result = '';
    const words = this.#value.split(' ');
    words.forEach(word => {
      const tmp =
        result +
        word
          .trim()
          .replace(/\r?\n|\r| /g, ' ')
          .replace(/\s\s+/g, ' ') +
        ' ';
      if (tmp.length <= length - 4) {
        result = tmp;
      }
    });
    this.#value = result + '...';
    return this;
  }

  /**
   * Tạo ra 1 chuỗi ngẫu nhiên.
   * @param {int} length Độ dài chuỗi
   * @param {object} options Cấu hình điều kiện để tạo chuỗi
   * @return string
   */
  random(length = 16, options = {}) {
    const UPPERCASE_CHAR_CODES = this.#arrayFromLowToHigh(65, 90);
    const LOWCASE_CHAR_CODES = this.#arrayFromLowToHigh(97, 122);
    const NUMBER_CHAR_CODES = this.#arrayFromLowToHigh(48, 57);
    const SYMBOL_CHAR_CODES = this.#arrayFromLowToHigh(33, 47).concat(
      this.#arrayFromLowToHigh(58, 64).concat(
        this.#arrayFromLowToHigh(91, 96).concat(this.#arrayFromLowToHigh(123, 126))
      )
    );
    let charCodes = LOWCASE_CHAR_CODES;
    if (options.includeUppercase) charCodes = charCodes.concat(UPPERCASE_CHAR_CODES);
    if (options.includeNumbers) charCodes = charCodes.concat(NUMBER_CHAR_CODES);
    if (options.includeSymbols) charCodes = charCodes.concat(SYMBOL_CHAR_CODES);
    const result = [];
    for (let i = 0; i < length; i++) {
      const character = charCodes[Math.floor(Math.random() * charCodes.length)];
      result.push(String.fromCharCode(character));
    }

    return result.join('');
  }

  replace(regexp, replacer) {
    this.#value = this.#value.replace(regexp, replacer);
    return this;
  }

  #arrayFromLowToHigh(low, high) {
    let array = [];
    for (let i = low; i <= high; i++) array.push(i);
    return array;
  }

  /**
   * Chuyển dữ liệu về kiểu chuỗi.
   * @param {object|number|string} value
   * @return string
   */
  caseString(value) {
    return typeof value === 'object' &&
      (value.hasOwnProperty('toString') || value.toString === Object.prototype.toString)
      ? value.toString()
      : `${value}`;
  }

  /**
   * Xuất giá trị chuỗi sau khi xử lý.
   * @return string
   */
  toString() {
    return this.#value;
  }

  /**
   * Một alias của hàm toString và có thể substring.
   * @param {number} start index kí tự bắt đầu cắt
   * @param {number} end index trước ký tự kết thúc cắt
   * @return string
   */
  get(start = 0, end = 0) {
    if (end > 0) {
      return this.toString().substring(start, end);
    }
    return this.toString();
  }
}

module.exports = Str;
