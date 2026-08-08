package com.triagenet.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.triagenet.entity.District;
import com.triagenet.entity.Hospital;
import com.triagenet.repository.DistrictRepository;
import com.triagenet.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.Iterator;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class HospitalSeedService {

    private final HospitalRepository hospitalRepository;
    private final DistrictRepository districtRepository;
    private final ObjectMapper objectMapper;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedJharkhandData() {
        if (districtRepository.count() > 0 && hospitalRepository.count() > 0) {
            log.info("Database already seeded with {} districts and {} hospitals. Skipping seed.",
                    districtRepository.count(), hospitalRepository.count());
            return;
        }

        try {
            ClassPathResource resource = new ClassPathResource("seed/jharkhand-hospitals.json");
            if (!resource.exists()) {
                log.warn("Seed file seed/jharkhand-hospitals.json not found on classpath.");
                return;
            }

            log.info("Seeding Jharkhand state healthcare nodes from seed/jharkhand-hospitals.json...");
            InputStream is = resource.getInputStream();
            JsonNode rootNode = objectMapper.readTree(is);

            JsonNode districtsNode = rootNode.get("districts");
            if (districtsNode != null && districtsNode.isObject()) {
                Iterator<Map.Entry<String, JsonNode>> fields = districtsNode.fields();
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> entry = fields.next();
                    String distName = entry.getKey();
                    JsonNode dinfo = entry.getValue();

                    District district = District.builder()
                            .name(distName)
                            .stateCode("JH")
                            .lat(dinfo.get("lat").asDouble())
                            .lng(dinfo.get("lng").asDouble())
                            .cmoName(dinfo.has("cmo") ? dinfo.get("cmo").asText() : "District CMO")
                            .cmoPhone(dinfo.has("phone") ? dinfo.get("phone").asText() : "+91-651-0000000")
                            .totalHospitals(0)
                            .build();

                    districtRepository.save(district);
                }
            }

            JsonNode hospitalsNode = rootNode.get("hospitals");
            if (hospitalsNode != null && hospitalsNode.isArray()) {
                for (JsonNode hnode : hospitalsNode) {
                    String name = hnode.get("name").asText();
                    String distName = hnode.get("districtName").asText();
                    String tier = hnode.has("facilityTier") ? hnode.get("facilityTier").asText() : "DISTRICT";
                    double lat = hnode.get("latitude").asDouble();
                    double lng = hnode.get("longitude").asDouble();

                    int genTotal = hnode.has("totalGeneralBeds") ? hnode.get("totalGeneralBeds").asInt() : 100;
                    int genAvail = hnode.has("availableGeneralBeds") ? hnode.get("availableGeneralBeds").asInt() : 20;
                    int icuTotal = hnode.has("totalIcuBeds") ? hnode.get("totalIcuBeds").asInt() : 10;
                    int icuAvail = hnode.has("availableIcuBeds") ? hnode.get("availableIcuBeds").asInt() : 2;

                    Hospital hospital = Hospital.builder()
                            .name(name)
                            .shortCode(name.replaceAll("[^A-Z]", ""))
                            .region(distName)
                            .districtName(distName)
                            .facilityTier(tier)
                            .lat(lat)
                            .lng(lng)
                            .totalBeds(genTotal + icuTotal)
                            .usedBeds((genTotal - genAvail) + (icuTotal - icuAvail))
                            .totalGeneralBeds(genTotal)
                            .availableGeneralBeds(genAvail)
                            .totalIcuBeds(icuTotal)
                            .availableIcuBeds(icuAvail)
                            .totalVentilators(hnode.has("hasVentilator") && hnode.get("hasVentilator").asBoolean() ? 15 : 2)
                            .usedVentilators(1)
                            .totalSpecialists(tier.equals("TERTIARY") ? 10 : 3)
                            .usedSpecialists(1)
                            .icuiCapacityRatio((double)(icuTotal - icuAvail) / Math.max(1, icuTotal))
                            .hasVentilator(hnode.has("hasVentilator") ? hnode.get("hasVentilator").asBoolean() : true)
                            .hasTraumaSurgery(hnode.has("hasTraumaSurgery") ? hnode.get("hasTraumaSurgery").asBoolean() : false)
                            .hasBloodBank(hnode.has("hasBloodBank") ? hnode.get("hasBloodBank").asBoolean() : false)
                            .hasOxygenGenerator(hnode.has("hasOxygenGenerator") ? hnode.get("hasOxygenGenerator").asBoolean() : true)
                            .build();

                    hospitalRepository.save(hospital);
                }
            }

            log.info("Successfully seeded {} districts and {} healthcare facilities for Jharkhand State!",
                    districtRepository.count(), hospitalRepository.count());

        } catch (Exception e) {
            log.error("Failed to seed Jharkhand data: ", e);
        }
    }
}
