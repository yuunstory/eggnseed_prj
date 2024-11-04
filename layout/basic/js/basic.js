/**
 * hasClass
 */
function hasClass(element, className) {
  return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
}

/**
 *  toggle
 */
function toggleClassAll(element, handler, className) {
  var _handler = document.querySelector(handler);
  document.querySelectorAll(handler).forEach(function (item) {
    item.addEventListener('click', function () {
      var _element = item.parentNode;
      if (hasClass(_element, className)) {
        _element.classList.remove(className);
      } else {
        _element.classList.add(className);
      }
    });
  });
}

/**
 *  findElements
 */
function findElements(element, findElement) {
  var resultElements = [];
  document.querySelectorAll(element).forEach(function (item) {
    var findElementList = item.querySelectorAll(findElement);
    findElementList = Array.prototype.slice.call(findElementList);
    resultElements = resultElements.concat(findElementList);
  });
  return resultElements;
}

/**
 *  setAttributeAl
 */
function setAttributeAll(elements, name, value) {
  elements.forEach(function (item) {
    item.setAttribute(name, value);
  });
}

/**
 *  상품 섬네일 로드되지 않을 경우, 기본값 설정
 */
function setDefaultImage(element) {
  document.querySelectorAll(element).forEach(function (item) {
    var $img = new Image();
    $img.onerror = function () {
      item.src = '//img.echosting.cafe24.com/thumb/img_product_big.gif';
    };
    $img.src = item.src;
  });
}

/**
 *  tooltip
 */
function setTooltipEvent() {
  var input = findElements('.eTooltip', 'input');
  input.forEach(function (item) {
    item.addEventListener('focusin', function (event) {
      var targetName = returnTargetName(event.target);
      targetName.nextElementSibling.style.display = 'block';
    });
    item.addEventListener('focusout', function (event) {
      var targetName = returnTargetName(event.target);
      targetName.nextElementSibling.style.display = 'none';
    });
  });
}

/**
 *  tooltip input focus
 */
function returnTargetName(_this) {
  var ePlacename = _this.parentElement.getAttribute('class');
  var targetName;
  if (ePlacename == 'ePlaceholder') {
    //ePlaceholder supported
    targetName = _this.parentElement;
  } else {
    targetName = _this;
  }
  return targetName;
}

/**
 * window load
 */
window.addEventListener('load', function () {
  if (document.querySelector('.thumbnail')) {
    setDefaultImage('.thumbnail img');
  }
  if (document.querySelector('.eTooltip')) {
    setAttributeAll(findElements('.eTooltip', '.btnClose'), 'tabIndex', '-1');
    setTooltipEvent();
  }
  if (document.querySelector('div.eToggle')) {
    toggleClassAll(false, 'div.eToggle .title', 'selected');
  }
});

//placeholder
$('.ePlaceholder input, .ePlaceholder textarea').each(function (i) {
  var placeholderName = $(this).parents().attr('title'); //title에 입력된 문구를 placeholder로 넣어줍니다.
  $(this).attr('placeholder', placeholderName);
});
/* placeholder ie8, ie9 */ //placeholder는 IE8,9에서 지원하지 않아 아래 코드가 필요합니다.
$.fn.extend({
  placeholder: function () {
    //IE 8 버전에는 hasPlaceholderSupport() 값이 false를 리턴
    if (hasPlaceholderSupport() === true) {
      return this;
    }
    //hasPlaceholderSupport() 값이 false 일 경우 아래 코드를 실행
    return this.each(function () {
      var findThis = $(this);
      var sPlaceholder = findThis.attr('placeholder');
      if (!sPlaceholder) {
        return;
      }
      findThis.wrap('<label class="ePlaceholder" />');
      var sDisplayPlaceHolder = $(this).val() ? ' style="display:none;"' : '';
      findThis.before('<span' + sDisplayPlaceHolder + '>' + sPlaceholder + '</span>');
      this.onpropertychange = function (e) {
        e = event || e;
        if (e.propertyName == 'value') {
          $(this).trigger('focusout');
        }
      };
      //공통 class
      var agent = navigator.userAgent.toLowerCase();
      if (agent.indexOf('msie') != -1) {
        $('.ePlaceholder').css({ position: 'relative' });
        $('.ePlaceholder span').css({ position: 'absolute', padding: '0 4px', color: '#878787' });
        $('.ePlaceholder label').css({ padding: '0' });
      }
    });
  },
});

$(':input[placeholder]').placeholder(); //placeholder() 함수를 호출

//클릭하면 placeholder 숨김
$('body').delegate('.ePlaceholder span', 'click', function () {
  $(this).hide();
});

//input창 포커스 인 일때 placeholder 숨김
$('body').delegate('.ePlaceholder :input', 'focusin', function () {
  $(this).prev('span').hide();
});

//input창 포커스 아웃 일때 value 가 true 이면 숨김, false 이면 보여짐
$('body').delegate('.ePlaceholder :input', 'focusout', function () {
  if (this.value) {
    $(this).prev('span').hide();
  } else {
    $(this).prev('span').show();
  }
});

//input에 placeholder가 지원이 되면 true를 안되면 false를 리턴값으로 던져줌
function hasPlaceholderSupport() {
  if ('placeholder' in document.createElement('input')) {
    return true;
  } else {
    return false;
  }
}
