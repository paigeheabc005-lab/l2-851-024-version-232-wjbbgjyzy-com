import { H as Hls } from './hls-dru42stk.js';

function setupHlsPlayer() {
  const video = document.querySelector('[data-player]');
  const button = document.querySelector('[data-play-button]');
  const cover = document.querySelector('[data-video-cover]');
  const status = document.querySelector('[data-player-status]');

  if (!video || !button) {
    return;
  }

  const source = video.dataset.src;
  let hlsInstance = null;

  const setStatus = (message) => {
    if (status) {
      status.textContent = message;
    }
  };

  const play = () => {
    if (!source) {
      setStatus('当前影片暂未配置播放源。');
      return;
    }

    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('正在使用浏览器原生 HLS 播放。');
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('HLS 播放源已就绪，可自动适配清晰度。');
      });
      hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        if (data && data.fatal) {
          setStatus('播放源加载异常，请稍后重试或更换浏览器。');
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    } else {
      setStatus('当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Safari 或移动端浏览器。');
      return;
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.play().catch(() => {
      setStatus('播放已准备，请再次点击播放器开始播放。');
    });
  };

  button.addEventListener('click', play);
}

document.addEventListener('DOMContentLoaded', setupHlsPlayer);
