"""用 Azure 語音服務把語音稿產生成 MP3。

用法：
  python tools/make_voice.py                 依 audio/lines.json 產生 audio/zh/*.mp3（已存在的會跳過）
  python tools/make_voice.py --test 文字 檔名  只產生一句試聽

audio/lines.json 由 tools/lines.html 產生：修改遊戲文字後，用瀏覽器開啟 tools/lines.html，
把頁面上的 JSON 存回 audio/lines.json，再執行本程式，只會補產生新的句子。

金鑰從使用者資料夾的 hjx-azure.env（或 hjx-azure.env.txt）讀取，不會顯示在畫面上。
"""
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
VOICE = 'zh-TW-HsiaoYuNeural'  # 曉雨，年輕女聲
RATE = '0%'                    # 正常語速
WAIT = 3.2                     # 免費方案每分鐘限 20 次請求


def load_key():
    home = Path.home()
    for name in ('hjx-azure.env', 'hjx-azure.env.txt'):
        f = home / name
        if f.exists():
            conf = {}
            for line in f.read_text(encoding='utf-8-sig').splitlines():
                if '=' in line:
                    k, v = line.split('=', 1)
                    conf[k.strip()] = v.strip()
            return conf['AZURE_SPEECH_KEY'], conf.get('AZURE_SPEECH_REGION', 'eastasia')
    sys.exit('找不到金鑰檔：請把 hjx-azure.env 存在 ' + str(home))


def synth(text, out, key, region):
    ssml = (
        "<speak version='1.0' xml:lang='zh-TW'>"
        f"<voice name='{VOICE}'><prosody rate='{RATE}'>{escape(text)}</prosody></voice>"
        '</speak>'
    )
    req = urllib.request.Request(
        f'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1',
        data=ssml.encode('utf-8'),
        headers={
            'Ocp-Apim-Subscription-Key': key,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
            'User-Agent': 'hjx-game',
        },
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                out.write_bytes(r.read())
                return
        except urllib.error.HTTPError as e:
            if e.code == 429:  # 太頻繁，等一下再試
                time.sleep(15 * (attempt + 1))
                continue
            sys.exit(f'Azure 回應錯誤 {e.code}：{e.read().decode("utf-8", "ignore")[:200]}')
    sys.exit('連續被限流，請稍後再執行')


def main():
    key, region = load_key()
    if len(sys.argv) >= 4 and sys.argv[1] == '--test':
        out = Path(sys.argv[3])
        synth(sys.argv[2], out, key, region)
        print('試聽檔：', out)
        return

    lines = json.loads((ROOT / 'audio' / 'lines.json').read_text(encoding='utf-8'))
    out_dir = ROOT / 'audio' / 'zh'
    out_dir.mkdir(parents=True, exist_ok=True)
    todo = [x for x in lines if not (out_dir / f"{x['h']}.mp3").exists()]
    print(f'共 {len(lines)} 句，需產生 {len(todo)} 句')
    for i, x in enumerate(todo, 1):
        synth(x['text'], out_dir / f"{x['h']}.mp3", key, region)
        print(f'[{i}/{len(todo)}] {x["text"]}', flush=True)
        if i < len(todo):
            time.sleep(WAIT)
    print('完成')


if __name__ == '__main__':
    main()
