import asyncio
import os
import json
import edge_tts
from pydub import AudioSegment

segments = [
    {
        "id": "act1_crisis",
        "start_sec": 0.8,
        "text": "In critical trauma, minutes decide mortality. Across twenty-four rural districts, delayed response has cost countless lives. Until now."
    },
    {
        "id": "act2_reveal",
        "start_sec": 11.5,
        "text": "Introducing TriageNet. The unified real-time emergency care grid orchestrating statewide trauma response."
    },
    {
        "id": "act3_devops",
        "start_sec": 20.2,
        "text": "Engineered with modern distributed architecture. High-throughput Spring Boot 3 reactive microservices, Redis in-memory queues, and multi-district Docker orchestration."
    },
    {
        "id": "act4_ml_benchmarks",
        "start_sec": 31.8,
        "text": "Powered by predictive machine learning. The SeverityScorer evaluates vital shock vectors, classifying level-one trauma in one point four eight milliseconds."
    },
    {
        "id": "act5_dfd_flow",
        "start_sec": 42.6,
        "text": "A mathematical data flow connects field telemetry directly to operating rooms with zero human friction."
    },
    {
        "id": "act6_telemetry",
        "start_sec": 51.5,
        "text": "Paramedics capture vital physiological signs with offline-first intake, streaming live telemetry and generating tamper-proof digital vouchers before transport begins."
    },
    {
        "id": "act7_dispatch",
        "start_sec": 63.2,
        "text": "State dispatchers dynamically balance hospital assignment, matching patient acuity to available intensive care beds with ninety-nine point four percent precision."
    },
    {
        "id": "act8_corridor",
        "start_sec": 74.0,
        "text": "Along the highway corridor, green wave navigation clears traffic lights ahead of the ambulance, cutting transit time by forty-two percent."
    },
    {
        "id": "act9_specialist",
        "start_sec": 85.0,
        "text": "At the trauma center, surgical teams and blood banks mobilize fifteen minutes before arrival for zero-minute door-to-OR handover."
    },
    {
        "id": "act10_governance",
        "start_sec": 95.2,
        "text": "Complete statewide accountability with emergency contingency liquidity, clinician roster verification, and automated Ayushman Bharat reimbursement."
    },
    {
        "id": "act11_finale",
        "start_sec": 105.0,
        "text": "TriageNet. Designed for life. Built for scale across thirty-nine million citizens."
    }
]

VOICE = "en-US-ChristopherNeural"
OUT_DIR = r"p:\TriageNet\video_production\my-video"
AUDIO_OUT = os.path.join(OUT_DIR, "public", "audio", "voiceover.mp3")
CAPTIONS_OUT = os.path.join(OUT_DIR, "src", "captions.json")

async def generate():
    os.makedirs(os.path.join(OUT_DIR, "public", "audio"), exist_ok=True)
    temp_files = []
    all_sentence_cues = []
    
    # Exactly 113.0 seconds = 113,000 ms (1:53)
    master_audio = AudioSegment.silent(duration=113000)
    
    for seg in segments:
        seg_id = seg["id"]
        text = seg["text"]
        start_ms = int(seg["start_sec"] * 1000)
        temp_mp3 = f"temp_{seg_id}.mp3"
        
        communicate = edge_tts.Communicate(text, VOICE, rate="+6%")
        sentences = []
        
        with open(temp_mp3, "wb") as f:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                elif chunk["type"] == "SentenceBoundary":
                    s_offset_ms = int(chunk["offset"] / 10000)
                    s_dur_ms = int(chunk["duration"] / 10000)
                    s_text = chunk["text"]
                    
                    words_raw = s_text.split()
                    word_dur = s_dur_ms / max(1, len(words_raw))
                    words_data = []
                    for idx, w in enumerate(words_raw):
                        w_start = start_ms + s_offset_ms + int(idx * word_dur)
                        w_end = start_ms + s_offset_ms + int((idx + 1) * word_dur)
                        words_data.append({
                            "word": w,
                            "startMs": w_start,
                            "endMs": w_end
                        })
                    
                    sentences.append({
                        "text": s_text,
                        "startMs": start_ms + s_offset_ms,
                        "endMs": start_ms + s_offset_ms + s_dur_ms,
                        "words": words_data
                    })
        
        all_sentence_cues.extend(sentences)
        seg_audio = AudioSegment.from_file(temp_mp3)
        master_audio = master_audio.overlay(seg_audio, position=start_ms)
        temp_files.append(temp_mp3)

    master_audio.export(AUDIO_OUT, format="mp3", bitrate="192k")
    print(f"Exported master voiceover to {AUDIO_OUT} ({len(master_audio)} ms)")

    with open(CAPTIONS_OUT, "w", encoding="utf-8") as f:
        json.dump(all_sentence_cues, f, indent=2)
    print(f"Saved {len(all_sentence_cues)} sentence cues with word timings to {CAPTIONS_OUT}")

    for t in temp_files:
        if os.path.exists(t):
            os.remove(t)

if __name__ == "__main__":
    asyncio.run(generate())
