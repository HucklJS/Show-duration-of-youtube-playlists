'use strict'

// 78
// -->
// { extraM: 1, s: 18 }
const secondsToMinutes = seconds => {
  const extraM = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)

  return { extraM, s }
}

// 128
// -->
// { extraH: 2, m: 8 }
const minutesToHours = minutes => {
  const extraH = Math.floor(minutes / 60)
  const m = Math.floor(minutes % 60)

  return { extraH, m }
}

// mutate incoming object
const formatTotalTime = totalTime => {
  const { extraM, s } = secondsToMinutes(totalTime.seconds)
  totalTime.seconds = s
  totalTime.minutes += extraM

  const { extraH, m } = minutesToHours(totalTime.minutes)
  totalTime.minutes = m
  totalTime.hours += extraH

  totalTime.seconds = ('0' + totalTime.seconds).slice(-2)
  totalTime.minutes = ('0' + totalTime.minutes).slice(-2)
  totalTime.hours = String(totalTime.hours)

  return totalTime
}

// ['1:34:35', '38:05', '1:31:34', '44:17', '47:25', '11:56']
// -->
// { hours: '5', minutes: '27', seconds: '52' }
const calculateTotalTime = times => {
  const totalTimeBeforeCalculation = {
    hours: 0,
    minutes: 0,
    seconds: 0,
  }

  const totalTime = times.reduce((totalTime, time) => {
    const [ ss, mm, hh = 0 ] = time
      .split(':')
      .reverse()
      .map(Number)

    totalTime.seconds += ss
    totalTime.minutes += mm
    totalTime.hours += hh

    return totalTime
  }, totalTimeBeforeCalculation)

  return formatTotalTime(totalTime)
}

const calculateAverageTime = (totalTime, numberOfVideos) => {
  const { hours, minutes, seconds} = totalTime
  const totalTimeInSeconds = (hours * 60 * 60) + (minutes * 60) + Number(seconds)
  const timeInSecondsPerVideo = Math.round(totalTimeInSeconds / numberOfVideos)

  const avgTime = {
    hours: 0,
    minutes: 0,
    seconds: timeInSecondsPerVideo,
  }

  return formatTotalTime(avgTime)
}

function showDurationOfYoutubePlaylist() {
  try {
    console.group('Extension which show duration of youtube playlists')
    console.log('start showDurationOfYoutubePlaylist')

    const url = location.href
    if (!url.includes('.youtube.com/playlist?list')) {
      return
    }

    const $fieldForAppendInfo = document.querySelector(
      '#page-manager > ytd-browse > ytd-playlist-header-renderer > '
      + 'div > div.immersive-header-content.ytd-playlist-header-renderer > '
      + 'div.thumbnail-and-metadata-wrapper.ytd-playlist-header-renderer > '
      + 'div > div.metadata-action-bar.ytd-playlist-header-renderer > '
      + 'div.metadata-text-wrapper.ytd-playlist-header-renderer > '
      + 'ytd-playlist-byline-renderer > div > yt-formatted-string:nth-child(2)'
    )

    if ($fieldForAppendInfo == null) {
      console.error(
        'Can\'t find $fieldForAppendInfo, ',
        'place where I\'d insert data'
      )
      return
    }

    const $videoFieldsWithTime = document.querySelectorAll(
      '#contents.ytd-playlist-video-list-renderer > '
      + '.ytd-playlist-video-list-renderer > '
      + '#content > '
      + '#container > '
      + '#thumbnail.ytd-playlist-video-renderer > '
      + 'a#thumbnail > '
      + "#overlays > "
      + '.ytd-thumbnail > '
      + '#text'
    )

    const times = Array.from($videoFieldsWithTime)
      .map($fieldWithTime => $fieldWithTime.textContent.trim())

    const totalTime = calculateTotalTime(times)
    const { hours, minutes, seconds} = totalTime
    const avgTime = calculateAverageTime(totalTime, times.length)

    const durationInfo = `
          (${hours}:${minutes}:${seconds}) 
          |
          (${avgTime.hours}:${avgTime.minutes}:${avgTime.seconds})
    `

    // update field if it was already created
    const $durationInfoField = document.querySelector(
      '.chrome-extension_show-duration-youtube-playlists'
    )

    if ($durationInfoField) {
      $durationInfoField.textContent = durationInfo
      $fieldForAppendInfo.append($durationInfoField)
      return
    }

    // if not...
    const html = /*html*/`
      <span class="chrome-extension_show-duration-youtube-playlists"> 
        ${durationInfo}
      </span>
    `

    $fieldForAppendInfo.insertAdjacentHTML(
      'beforeend',
      html
    )
  } catch (e) {
    console.error('Something went wrong, check below')
    console.error(e)
  } finally {
    console.log('finish showDurationOfYoutubePlaylist')
    console.groupEnd()
  }
}

function main() {
  document.body.addEventListener('yt-page-data-updated', () => {
    setTimeout(showDurationOfYoutubePlaylist, 800)
  })
  // document.body.addEventListener('yt-navigate-finish', showDurationOfYoutubePlaylist)

  // not work on page updates
  // document.body.addEventListener('yt-page-type-changed', showDurationOfYoutubePlaylist)
}

main()
