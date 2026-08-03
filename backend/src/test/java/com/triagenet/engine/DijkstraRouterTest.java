package com.triagenet.engine;

import com.triagenet.entity.HospitalEdge;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class DijkstraRouterTest {

    private DijkstraRouter router;

    @BeforeEach
    void setUp() {
        router = new DijkstraRouter();
    }

    @Test
    void testFindShortestPathDirectEdge() {
        UUID h1 = UUID.randomUUID();
        UUID h2 = UUID.randomUUID();

        List<HospitalEdge> edges = List.of(
                HospitalEdge.builder().fromHospitalId(h1).toHospitalId(h2).transferTimeMinutes(8.0).distanceKm(5.0).build()
        );

        DijkstraRouter.RouteResult result = router.findShortestRoute(h1, h2, edges);

        assertNotNull(result);
        assertEquals(8.0, result.getTotalMinutes());
        assertEquals(2, result.getPathHospitalIds().size());
        assertEquals(h1, result.getPathHospitalIds().get(0));
        assertEquals(h2, result.getPathHospitalIds().get(1));
    }

    @Test
    void testFindShortestPathMultiHop() {
        UUID h1 = UUID.randomUUID();
        UUID h2 = UUID.randomUUID();
        UUID h3 = UUID.randomUUID();

        List<HospitalEdge> edges = Arrays.asList(
                HospitalEdge.builder().fromHospitalId(h1).toHospitalId(h2).transferTimeMinutes(5.0).distanceKm(3.0).build(),
                HospitalEdge.builder().fromHospitalId(h2).toHospitalId(h3).transferTimeMinutes(7.0).distanceKm(4.5).build(),
                HospitalEdge.builder().fromHospitalId(h1).toHospitalId(h3).transferTimeMinutes(20.0).distanceKm(15.0).build()
        );

        DijkstraRouter.RouteResult result = router.findShortestRoute(h1, h3, edges);

        assertNotNull(result);
        assertEquals(12.0, result.getTotalMinutes(), "Multi-hop path h1->h2->h3 (5+7=12m) should be shorter than direct (20m)");
        assertEquals(3, result.getPathHospitalIds().size());
    }
}
