-- Client-side Lua script for FiveM crosshair customization
-- File: client.lua

local isMenuOpen = false
local currentCrosshair = "default"
local crosshairSettings = {
    size = 3.5,
    color = {r = 255, g = 255, b = 255, a = 255},
    killEffectEnabled = false
}

-- Register the /crosshair command
RegisterCommand("crosshair", function(source, args, rawCommand)
    isMenuOpen = not isMenuOpen
    SetNuiFocus(isMenuOpen, isMenuOpen)
    SendNUIMessage({
        type = "toggleMenu",
        show = isMenuOpen
    })
end, false)

-- Load saved settings
Citizen.CreateThread(function()
    local savedSettings = LoadResourceFile(GetCurrentResourceName(), "settings.json")
    if savedSettings then
        crosshairSettings = json.decode(savedSettings)
    end
end)

-- Save settings
function SaveSettings()
    SaveResourceFile(GetCurrentResourceName(), "settings.json", json.encode(crosshairSettings), -1)
end

-- NUI callback for updating crosshair settings
RegisterNUICallback("updateCrosshair", function(data, cb)
    currentCrosshair = data.crosshair or currentCrosshair
    crosshairSettings.size = data.size or crosshairSettings.size
    crosshairSettings.color = data.color or crosshairSettings.color
    crosshairSettings.killEffectEnabled = data.killEffectEnabled or crosshairSettings.killEffectEnabled
    
    -- Apply crosshair settings
    SendNUIMessage({
        type = "updateCrosshairDisplay",
        crosshair = currentCrosshair,
        size = crosshairSettings.size,
        color = crosshairSettings.color
    })
    
    SaveSettings()
    cb("ok")
end)

-- Handle player killed event
AddEventHandler("gameEventTriggered", function(eventName, args)
    if eventName == "CEventNetworkEntityDamage" and crosshairSettings.killEffectEnabled then
        local victim = args[1]
        local attacker = args[2]
        local isDead = args[6]
        
        if isDead and attacker == PlayerPedId() then
            -- Get victim player info
            local victimServerId = NetworkGetPlayerIndexFromPed(victim)
            local victimPlayer = GetPlayerFromServerId(victimServerId)
            
            if victimPlayer ~= -1 then
                local victimName = GetPlayerName(victimPlayer)
                -- Send kill info to NUI
                SendNUIMessage({
                    type = "showKillEffect",
                    victimName = victimName
                })
                
                -- Play kill sound
                PlaySoundFrontend(-1, "SELECT", "HUD_MINI_GAME_SOUNDSET", true)
            end
        end
    end
end)

-- Close menu on escape
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if isMenuOpen and IsControlJustPressed(0, 322) then -- ESC key
            isMenuOpen = false
            SetNuiFocus(false, false)
            SendNUIMessage({
                type = "toggleMenu",
                show = false
            })
        end
    end
end)
