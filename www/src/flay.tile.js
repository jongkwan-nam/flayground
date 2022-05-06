import $ from 'jquery';
import { LocalStorageItem, Random } from './lib/crazy.common.js';
import { Rest } from './lib/flay.rest.service.js';
import { View, Util } from './lib/flay.utils.js';
import { FILEINFO } from './lib/flay.view.card.js';
import './lib/crazy.jquery.js';
import './flay.tile.scss';

let flayList;
let currFlayIndex = 0;
let totalDisplayCount = 0;
let rank0 = false,
  rank1 = false,
  rank2 = false,
  rank3 = false,
  rank4 = false,
  rank5 = false;
let wide = false;

// get initial values
$('#rank0').prop('checked', LocalStorageItem.getBoolean('flay.tile.rank0', true));
$('#rank1').prop('checked', LocalStorageItem.getBoolean('flay.tile.rank1', false));
$('#rank2').prop('checked', LocalStorageItem.getBoolean('flay.tile.rank2', false));
$('#rank3').prop('checked', LocalStorageItem.getBoolean('flay.tile.rank3', false));
$('#rank4').prop('checked', LocalStorageItem.getBoolean('flay.tile.rank4', false));
$('#rank5').prop('checked', LocalStorageItem.getBoolean('flay.tile.rank5', false));
$('#wideTile')
  .prop('checked', LocalStorageItem.getBoolean('flay.tile.wideTile', true))
  .on('change', function () {
    console.log(this.checked);
    $('#wideTile ~ span').html(this.checked ? 'Wide' : 'Slim');
    $('#tileWrap > .tile').toggleClass('wide', this.checked);
  })
  .trigger('change');

// add event listener for checkbox
$('input:checkbox').on('change', function () {
  LocalStorageItem.set('flay.tile.' + $(this).attr('id'), $(this).prop('checked'));
  displayCountByCheckedRank();
});

// add evebt listener for navigation
$('#tileWrap')
  .navEvent(function (signal) {
    switch (signal) {
      case 32: // keyup : space
        displayTile(true);
        break;
      case -1: // wheel: down
        displayTile(false);
        break;
    }
  })
  .navActive(false);

// add event listener for playing info close
$('#playingClose').on('click', function () {
  $('#playingWrap').hide();
});

// load flay and display
Rest.Flay.list(function (list) {
  $('#countFlayByTotal').html(list.length);
  flayList = list;
  displayCountByCheckedRank();
  displayTile(true);
});

function obtainCheckedValue() {
  rank0 = $('#rank0').prop('checked');
  rank1 = $('#rank1').prop('checked');
  rank2 = $('#rank2').prop('checked');
  rank3 = $('#rank3').prop('checked');
  rank4 = $('#rank4').prop('checked');
  rank5 = $('#rank5').prop('checked');
  wide = $('#wideTile').prop('checked');
  // console.log(rank0, rank1, rank2, rank3, rank4, rank5, wide);
}

function displayCountByCheckedRank() {
  obtainCheckedValue();
  let countFlayByCheckedRank = 0;
  for (let flay of flayList) {
    if (isCheckedRank(flay)) {
      ++countFlayByCheckedRank;
    }
  }
  // console.log('countFlayByCheckedRank', countFlayByCheckedRank);
  $('#countFlayByCheckedRank').html(countFlayByCheckedRank);
}

function isCheckedRank(flay) {
  return !(flay.video.rank < 0 || (!rank0 && flay.video.rank === 0) || (!rank1 && flay.video.rank === 1) || (!rank2 && flay.video.rank === 2) || (!rank3 && flay.video.rank === 3) || (!rank4 && flay.video.rank === 4) || (!rank5 && flay.video.rank === 5));
}

function displayTile(isFirst) {
  $('#tileWrap').navActive(false);

  if (isFirst) {
    currFlayIndex = Random.getInteger(0, flayList.length - 1);
  }

  let $tileWrap = $('#tileWrap').empty();
  let tileWrapHeight = $tileWrap.height() + 32;
  let tileList = [];

  obtainCheckedValue();

  if (!rank0 && !rank1 && !rank2 && !rank3 && !rank4 && !rank5) {
    return;
  }

  let roopIndex = 0;
  do {
    if (currFlayIndex >= flayList.length) {
      currFlayIndex = 0;
    }

    let flay = flayList[currFlayIndex++];
    if (!isCheckedRank(flay)) {
      continue;
    }

    let $tile = $('<dl>', {
      class: 'tile' + (wide ? ' wide' : ''),
      flayIndex: currFlayIndex,
    })
      .data('flay', flay)
      .on('click', function (e) {
        let $this = $(this);
        let _flay = $this.data('flay');
        Rest.Flay.play(_flay, function () {
          $this.addClass('played');
          $('#playing .flay-card').remove();
          $('#playing').appendFlayCard(flay, {
            width: 800,
            exclude: [FILEINFO],
            css: {
              margin: 0,
            },
          });
          $('#playingWrap').show();
        });
      })
      .append(
        $('<dt>', { class: 'title nowrap' })
          .html(flay.title)
          .on('click', function (e) {
            e.stopPropagation();
            let _flay = $(this).parent().data('flay');
            View.flay(_flay.opus);
          }),
        $('<dd>', { class: 'studio nowrap' })
          .html(flay.studio)
          .on('click', function (e) {
            e.stopPropagation();
          }),
        $('<dd>', { class: 'opus nowrap' })
          .html(flay.opus)
          .on('click', function (e) {
            e.stopPropagation();
          }),
        $('<dd>', { class: 'rank nowrap' })
          .html('Rank ' + flay.video.rank)
          .on('click', function (e) {
            e.stopPropagation();
          }),
        $('<dd>', { class: 'actress nowrap' }).html(Util.Actress.getNames(flay.actressList)),
        $('<dd>', { class: 'release nowrap' })
          .html(flay.release)
          .on('click', function (e) {
            e.stopPropagation();
          }),
        $('<dd>', { class: 'file nowrap' })
          .html(File.formatSize(flay.length) + (flay.files.movie.length > 1 ? ' ' + flay.files.movie.length + 'v' : ''))
          .on('click', function (e) {
            e.stopPropagation();
          })
      );

    if (roopIndex++ % 2 === 0) {
      $tile.prependTo($tileWrap);
    } else {
      $tile.appendTo($tileWrap);
    }

    ++totalDisplayCount;

    let bottom = $tile.position().top + $tile.height();
    if (tileWrapHeight < bottom) {
      $tile.remove();
      --currFlayIndex;
      --totalDisplayCount;
      break;
    }

    tileList.push($tile);
    // eslint-disable-next-line no-constant-condition
  } while (true);

  // one more check overflow flay tile
  let $lastTile = $('#tileWrap .tile:last-child');
  let bottom = $lastTile.position().top + $lastTile.height();
  if (tileWrapHeight < bottom) {
    let $popped = tileList.pop();
    $popped.remove();
    --currFlayIndex;
    --totalDisplayCount;
  }

  $('#countFlayByDisplay').html(totalDisplayCount);

  if (Random.getBoolean()) {
    let indexArray = Array.apply(null, { length: tileList.length }).map(Number.call, Number);
    let timer = setInterval(function () {
      let tileIndex = indexArray.splice(Random.getInteger(0, indexArray.length - 1), 1);
      if ($.isEmptyObject(tileIndex)) {
        clearInterval(timer);
        $('#tileWrap').navActive(true);
      } else {
        let $tile = tileList[tileIndex];
        let flay = $tile.data('flay');
        $tile.css({
          background: 'url(/static/cover/' + flay.opus + ') right top / cover no-repeat',
        });
      }
    }, Random.getInteger(10, 150));
  } else {
    let flowDirection = Random.getBoolean();
    let tileIndex = flowDirection ? 0 : tileList.length;
    let timer = setInterval(function () {
      let $tile = tileList[flowDirection ? tileIndex++ : --tileIndex];
      if ($tile) {
        let flay = $tile.data('flay');
        $tile.css({
          background: 'url(/static/cover/' + flay.opus + ') right top / cover no-repeat',
        });
      } else {
        clearInterval(timer);
        $('#tileWrap').navActive(true);
      }
    }, Random.getInteger(0, 150));
  }
}
