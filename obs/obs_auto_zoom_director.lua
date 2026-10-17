-- TriageNet OBS Studio Cinematic Auto-Zoom & Recording Director
-- Automates camera zoom in, pan, zoom out, browser choreography, and recording for TriageNet presentations
-- Author: Google Antigravity (TriageNet Systems)

local obs = obslua

-- Configuration variables
local target_source_name = "(Auto-Detect Current Scene Source)"
local is_running = false
local current_time = 0.0
local fps_timer = 20 -- 50 FPS smooth interpolation (20ms tick)

-- Camera transform state
local current_scale = 1.0
local current_pos_x = 0.0
local current_pos_y = 0.0

-- Base resolution (Queried dynamically from OBS, defaults to 1920x1080)
local base_width = 1920
local base_height = 1080

-- Script Description
function script_description()
    return [[
<h2>🎬 TriageNet OBS Cinematic Auto-Zoom Director</h2>
<p>Automates screen recording for <b>TriageNet</b> with silky smooth cinematic camera pans, zooms, automated web simulation, and auto-stop recording.</p>
<ul>
  <li><b>Shoot 1: Web Console (65s)</b>: Zooms into GIS 3D Map, Dijkstra Route HUD, Specialist Doctor Roster, Triage Queue, and Capacity Matrix. Automatically drives live browser simulation via Director Sync.</li>
  <li><b>Shoot 2: Mobile App (63s)</b>: Focuses on BlueStacks companion app frame with smooth zooms on sliders, Green Wave siren, and handover vouchers. Automatically drives ADB mobile interactions.</li>
</ul>
<p><i>Zero manual mouse movements. Zero retakes needed. Select your capture source below and click "Start Shoot".</i></p>
]]
end

-- Easing Function: Smooth Cubic Ease-In-Out
local function ease_in_out(t)
    if t < 0.5 then
        return 4 * t * t * t
    else
        local p = 2 * t - 2
        return 0.5 * p * p * p + 1
    end
end

-- Web Console Timeline (68 Seconds: 5 Major Modules)
-- Stable 1.0x Full Widescreen: The website itself switches chapters smoothly with zero weird cropping
local web_timeline = {
    { start_time = 0.0,  duration = 14.0, scale = 1.00, pos_x = 0, pos_y = 0, label = "Chapter 1: 3D GIS Highway Ambulance & Dijkstra Routing (NH-33)" },
    { start_time = 14.0, duration = 14.0, scale = 1.00, pos_x = 0, pos_y = 0, label = "Chapter 2: Triage Priority Heap Queue & Code Red Emergency Intake" },
    { start_time = 28.0, duration = 14.0, scale = 1.00, pos_x = 0, pos_y = 0, label = "Chapter 3: Specialist Doctor Rosters & 1st/2nd/3rd Apex Matching" },
    { start_time = 42.0, duration = 14.0, scale = 1.00, pos_x = 0, pos_y = 0, label = "Chapter 4: Statewide 24-District Hospital Capacity Matrix & Bed Reallocation" },
    { start_time = 56.0, duration = 12.0, scale = 1.00, pos_x = 0, pos_y = 0, label = "Chapter 5: AI Clinical Decision Support (CDS) & Operational Overview" },
    { start_time = 68.0, duration = 0.1,  scale = 1.00, pos_x = 0, pos_y = 0, label = "End Shoot & Auto-Stop Recording" }
}

-- Mobile App Timeline (63 Seconds)
-- Stable centered frame: Keeps the full BlueStacks phone frame cleanly in the center
local mobile_timeline = {
    { start_time = 0.0,  duration = 8.0,  scale = 1.00, pos_x = 0, pos_y = 0, label = "Chapter 1: 108 ALS Paramedic Companion Frame & Welcome" },
    { start_time = 8.0,  duration = 12.0, scale = 1.00, pos_x = 0, pos_y = 0, label = "Chapter 2: Interactive 4-Step Onboarding Walkthrough" },
    { start_time = 20.0, duration = 16.0, scale = 1.00, pos_x = 0, pos_y = 0, label = "Chapter 3: Real-Time Clinical Vitals & Trauma Score Sliders" },
    { start_time = 36.0, duration = 12.0, scale = 1.00, pos_x = 0, pos_y = 0, label = "Chapter 4: 108 Green Wave Traffic Siren & Corridor Routing" },
    { start_time = 48.0, duration = 15.0, scale = 1.00, pos_x = 0, pos_y = 0, label = "Chapter 5: Trauma Bay Pre-Alert Voucher & Live Handover Checklist" },
    { start_time = 63.0, duration = 0.1,  scale = 1.00, pos_x = 0, pos_y = 0, label = "End Shoot & Auto-Stop Recording" }
}

local active_timeline = web_timeline

-- Query base resolution from OBS video settings
local function update_base_resolution()
    local ovi = obs.obs_video_info()
    if obs.obs_get_video_info(ovi) then
        if ovi.base_width > 0 and ovi.base_height > 0 then
            base_width = ovi.base_width
            base_height = ovi.base_height
        end
    end
end

-- Find target scene item in the current scene
local function get_target_scene_item()
    local current_scene_source = obs.obs_frontend_get_current_scene()
    if not current_scene_source then return nil end

    local scene = obs.obs_scene_from_source(current_scene_source)
    local target_item = nil

    if scene then
        -- 1. Explicit source lookup
        if target_source_name and target_source_name ~= "" and target_source_name ~= "(Auto-Detect Current Scene Source)" then
            target_item = obs.obs_scene_find_source(scene, target_source_name)
            if not target_item and obs.obs_scene_find_source_recursive then
                target_item = obs.obs_scene_find_source_recursive(scene, target_source_name)
            end
        end

        -- 2. Fallback: Auto-detect first visible item in current scene
        if not target_item then
            local items = obs.obs_scene_enum_items(scene)
            if items then
                for _, item in ipairs(items) do
                    if obs.obs_sceneitem_visible(item) then
                        target_item = item
                        break
                    end
                end
                obs.sceneitem_list_release(items)
            end
        end
    end

    obs.obs_source_release(current_scene_source)
    return target_item
end

-- Apply transform to scene item
local function apply_camera_transform(scale, px, py)
    local item = get_target_scene_item()
    if not item then return end

    local scale_vec = obs.vec2()
    scale_vec.x = scale
    scale_vec.y = scale
    obs.obs_sceneitem_set_scale(item, scale_vec)

    local pos_vec = obs.vec2()
    pos_vec.x = px
    pos_vec.y = py
    obs.obs_sceneitem_set_pos(item, pos_vec)
end

-- Main Animation Loop Ticker (Runs at 50 FPS)
local function on_director_tick()
    if not is_running then return end

    current_time = current_time + (fps_timer / 1000.0)

    -- Locate current keyframe in active timeline
    local current_kf = active_timeline[1]
    local next_kf = active_timeline[2]

    for i = 1, #active_timeline - 1 do
        local kf = active_timeline[i]
        local nxt = active_timeline[i + 1]
        if current_time >= kf.start_time and current_time < nxt.start_time then
            current_kf = kf
            next_kf = nxt
            break
        end
    end

    -- Check if shoot completed
    local last_kf = active_timeline[#active_timeline]
    if current_time >= last_kf.start_time then
        -- Stop recording and end shoot
        is_running = false
        obs.timer_remove(on_director_tick)
        apply_camera_transform(1.0, 0, 0)

        if obs.obs_frontend_recording_active() then
            obs.obs_frontend_recording_stop()
        end

        -- Reset web sync if needed
        os.execute('start /B "" powershell -NoProfile -Command "Invoke-RestMethod -Uri http://localhost:3000/api/director-sync?shoot=stop -Method GET -ErrorAction SilentlyContinue"')
        print("🎬 [TriageNet OBS Director] Shoot completed successfully! Recording saved.")
        return
    end

    -- Interpolate between current_kf and next_kf
    local progress = (current_time - current_kf.start_time) / current_kf.duration
    if progress > 1.0 then progress = 1.0 end
    if progress < 0.0 then progress = 0.0 end

    local eased = ease_in_out(progress)

    -- Smoothly interpolate camera
    current_scale = current_kf.scale + (next_kf.scale - current_kf.scale) * eased
    current_pos_x = current_kf.pos_x + (next_kf.pos_x - current_kf.pos_x) * eased
    current_pos_y = current_kf.pos_y + (next_kf.pos_y - current_kf.pos_y) * eased

    apply_camera_transform(current_scale, current_pos_x, current_pos_y)
end

-- Start Shoot
local function start_shoot(timeline_type)
    if is_running then return end

    update_base_resolution()

    if timeline_type == "mobile" then
        active_timeline = mobile_timeline
        print("🎬 [TriageNet OBS Director] Initiating Mobile App Auto-Shoot (63s)...")
        -- Launch mobile ADB actor in background
        os.execute('start /B "" powershell -NoProfile -ExecutionPolicy Bypass -File "p:\\TriageNet\\obs\\auto_actor_mobile.ps1"')
    else
        active_timeline = web_timeline
        print("🎬 [TriageNet OBS Director] Initiating Web Console Auto-Shoot (68s)...")
        -- Directly trigger browser simulation via curl
        os.execute('curl.exe -s "http://localhost:3000/api/director-sync?shoot=web"')
    end

    current_time = 0.0
    current_scale = 1.0
    current_pos_x = 0.0
    current_pos_y = 0.0
    is_running = true

    -- Start OBS recording automatically if not already recording
    if not obs.obs_frontend_recording_active() then
        obs.obs_frontend_recording_start()
    end

    obs.timer_add(on_director_tick, fps_timer)
end

-- Stop / Reset Shoot
local function stop_shoot()
    is_running = false
    obs.timer_remove(on_director_tick)
    current_scale = 1.0
    current_pos_x = 0.0
    current_pos_y = 0.0
    apply_camera_transform(1.0, 0, 0)

    if obs.obs_frontend_recording_active() then
        obs.obs_frontend_recording_stop()
    end

    -- Stop web sync
    os.execute('start /B "" powershell -NoProfile -Command "Invoke-RestMethod -Uri http://localhost:3000/api/director-sync?shoot=stop -Method GET -ErrorAction SilentlyContinue"')
    print("⏹️ [TriageNet OBS Director] Shoot stopped. Camera reset to 1.0x wide.")
end

-- Button Callbacks
function on_btn_web_shoot(props, prop)
    start_shoot("web")
    return true
end

function on_btn_mobile_shoot(props, prop)
    start_shoot("mobile")
    return true
end

function on_btn_reset(props, prop)
    stop_shoot()
    return true
end

-- Hotkey Handlers
local hotkey_web_id = obs.OBS_INVALID_HOTKEY_ID
local hotkey_mobile_id = obs.OBS_INVALID_HOTKEY_ID
local hotkey_reset_id = obs.OBS_INVALID_HOTKEY_ID

function script_load(settings)
    update_base_resolution()

    hotkey_web_id = obs.obs_hotkey_register_frontend("triagenet_web_shoot", "🎬 TriageNet: Start Shoot 1 (Web Console)", function(pressed)
        if pressed then start_shoot("web") end
    end)

    hotkey_mobile_id = obs.obs_hotkey_register_frontend("triagenet_mobile_shoot", "🎬 TriageNet: Start Shoot 2 (Mobile App)", function(pressed)
        if pressed then start_shoot("mobile") end
    end)

    hotkey_reset_id = obs.obs_hotkey_register_frontend("triagenet_reset_shoot", "⏹️ TriageNet: Stop / Reset Camera", function(pressed)
        if pressed then stop_shoot() end
    end)

    local hotkey_save_array = obs.obs_data_get_array(settings, "triagenet_hotkeys")
    obs.obs_hotkey_load(hotkey_web_id, hotkey_save_array)
    obs.obs_hotkey_load(hotkey_mobile_id, hotkey_save_array)
    obs.obs_hotkey_load(hotkey_reset_id, hotkey_save_array)
    obs.obs_data_array_release(hotkey_save_array)
end

function script_save(settings)
    obs.obs_data_set_string(settings, "target_source", target_source_name)

    local hotkey_save_array = obs.obs_hotkey_save(hotkey_web_id)
    obs.obs_data_set_array(settings, "triagenet_hotkeys", hotkey_save_array)
    obs.obs_data_array_release(hotkey_save_array)
end

-- Define OBS Properties UI
function script_properties()
    local props = obs.obs_properties_create()

    -- Source Dropdown (Auto-populated with all sources in OBS)
    local p_sources = obs.obs_properties_add_list(
        props,
        "target_source",
        "Target Capture Source:",
        obs.OBS_COMBO_TYPE_LIST,
        obs.OBS_COMBO_FORMAT_STRING
    )

    -- Default Auto-Detect Option
    obs.obs_property_list_add_string(p_sources, "(Auto-Detect Current Scene Source)", "(Auto-Detect Current Scene Source)")

    local sources = obs.obs_enum_sources()
    if sources ~= nil then
        for _, source in ipairs(sources) do
            local name = obs.obs_source_get_name(source)
            obs.obs_property_list_add_string(p_sources, name, name)
        end
        obs.source_list_release(sources)
    end

    -- Control Action Buttons
    obs.obs_properties_add_button(props, "btn_web", "▶️ Start Shoot 1: Web Console (65s)", on_btn_web_shoot)
    obs.obs_properties_add_button(props, "btn_mobile", "▶️ Start Shoot 2: Mobile App (63s)", on_btn_mobile_shoot)
    obs.obs_properties_add_button(props, "btn_reset", "⏹️ Stop / Reset Camera (1.0x Wide)", on_btn_reset)

    return props
end

-- Update Script Settings
function script_update(settings)
    target_source_name = obs.obs_data_get_string(settings, "target_source")
end
