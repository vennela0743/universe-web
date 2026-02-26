package com.universe.backend.service;

import com.universe.backend.model.UniversityDomainMapping;
import com.universe.backend.repository.UniversityDomainMappingRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class UniversityDomainMappingService {

    private static final Logger logger = LoggerFactory.getLogger(UniversityDomainMappingService.class);

    private final UniversityDomainMappingRepository repository;

    public UniversityDomainMappingService(UniversityDomainMappingRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void initializeMappings() {
        long existingCount = repository.count();
        if (existingCount > 0) {
            logger.info("Found {} existing university domain mappings, checking for new entries...", existingCount);
        } else {
            logger.info("Initializing university domain mappings...");
        }

        List<UniversityDomainMapping> mappings = Arrays.asList(
            // Ivy League
            new UniversityDomainMapping("harvard.edu", "Harvard University", "Harvard", "MA"),
            new UniversityDomainMapping("yale.edu", "Yale University", "Yale", "CT"),
            new UniversityDomainMapping("princeton.edu", "Princeton University", "Princeton", "NJ"),
            new UniversityDomainMapping("columbia.edu", "Columbia University", "Columbia", "NY"),
            new UniversityDomainMapping("upenn.edu", "University of Pennsylvania", "Penn", "PA"),
            new UniversityDomainMapping("brown.edu", "Brown University", "Brown", "RI"),
            new UniversityDomainMapping("dartmouth.edu", "Dartmouth College", "Dartmouth", "NH"),
            new UniversityDomainMapping("cornell.edu", "Cornell University", "Cornell", "NY"),

            // Top Private Universities
            new UniversityDomainMapping("stanford.edu", "Stanford University", "Stanford", "CA"),
            new UniversityDomainMapping("mit.edu", "Massachusetts Institute of Technology", "MIT", "MA"),
            new UniversityDomainMapping("caltech.edu", "California Institute of Technology", "Caltech", "CA"),
            new UniversityDomainMapping("duke.edu", "Duke University", "Duke", "NC"),
            new UniversityDomainMapping("northwestern.edu", "Northwestern University", "Northwestern", "IL"),
            new UniversityDomainMapping("uchicago.edu", "University of Chicago", "UChicago", "IL"),
            new UniversityDomainMapping("rice.edu", "Rice University", "Rice", "TX"),
            new UniversityDomainMapping("vanderbilt.edu", "Vanderbilt University", "Vanderbilt", "TN"),
            new UniversityDomainMapping("notredame.edu", "University of Notre Dame", "Notre Dame", "IN"),
            new UniversityDomainMapping("nd.edu", "University of Notre Dame", "Notre Dame", "IN"),
            new UniversityDomainMapping("wustl.edu", "Washington University in St. Louis", "WashU", "MO"),
            new UniversityDomainMapping("emory.edu", "Emory University", "Emory", "GA"),
            new UniversityDomainMapping("georgetown.edu", "Georgetown University", "Georgetown", "DC"),
            new UniversityDomainMapping("cmu.edu", "Carnegie Mellon University", "CMU", "PA"),
            new UniversityDomainMapping("jhu.edu", "Johns Hopkins University", "Johns Hopkins", "MD"),
            new UniversityDomainMapping("usc.edu", "University of Southern California", "USC", "CA"),
            new UniversityDomainMapping("nyu.edu", "New York University", "NYU", "NY"),
            new UniversityDomainMapping("bu.edu", "Boston University", "BU", "MA"),
            new UniversityDomainMapping("bc.edu", "Boston College", "BC", "MA"),
            new UniversityDomainMapping("tufts.edu", "Tufts University", "Tufts", "MA"),
            new UniversityDomainMapping("brandeis.edu", "Brandeis University", "Brandeis", "MA"),
            new UniversityDomainMapping("neu.edu", "Northeastern University", "Northeastern", "MA"),
            new UniversityDomainMapping("case.edu", "Case Western Reserve University", "Case Western", "OH"),
            new UniversityDomainMapping("tulane.edu", "Tulane University", "Tulane", "LA"),
            new UniversityDomainMapping("smu.edu", "Southern Methodist University", "SMU", "TX"),
            new UniversityDomainMapping("tcu.edu", "Texas Christian University", "TCU", "TX"),
            new UniversityDomainMapping("baylor.edu", "Baylor University", "Baylor", "TX"),
            new UniversityDomainMapping("wake.edu", "Wake Forest University", "Wake Forest", "NC"),
            new UniversityDomainMapping("lehigh.edu", "Lehigh University", "Lehigh", "PA"),
            new UniversityDomainMapping("rpi.edu", "Rensselaer Polytechnic Institute", "RPI", "NY"),
            new UniversityDomainMapping("stevens.edu", "Stevens Institute of Technology", "Stevens", "NJ"),
            new UniversityDomainMapping("wpi.edu", "Worcester Polytechnic Institute", "WPI", "MA"),
            new UniversityDomainMapping("drexel.edu", "Drexel University", "Drexel", "PA"),
            new UniversityDomainMapping("villanova.edu", "Villanova University", "Villanova", "PA"),
            new UniversityDomainMapping("fordham.edu", "Fordham University", "Fordham", "NY"),
            new UniversityDomainMapping("syr.edu", "Syracuse University", "Syracuse", "NY"),
            new UniversityDomainMapping("pitt.edu", "University of Pittsburgh", "Pitt", "PA"),
            new UniversityDomainMapping("rochester.edu", "University of Rochester", "Rochester", "NY"),
            new UniversityDomainMapping("gwu.edu", "George Washington University", "GWU", "DC"),
            new UniversityDomainMapping("american.edu", "American University", "American", "DC"),
            new UniversityDomainMapping("howard.edu", "Howard University", "Howard", "DC"),

            // UC System
            new UniversityDomainMapping("berkeley.edu", "University of California, Berkeley", "UC Berkeley", "CA"),
            new UniversityDomainMapping("ucla.edu", "University of California, Los Angeles", "UCLA", "CA"),
            new UniversityDomainMapping("ucsd.edu", "University of California, San Diego", "UC San Diego", "CA"),
            new UniversityDomainMapping("ucsb.edu", "University of California, Santa Barbara", "UC Santa Barbara", "CA"),
            new UniversityDomainMapping("ucdavis.edu", "University of California, Davis", "UC Davis", "CA"),
            new UniversityDomainMapping("uci.edu", "University of California, Irvine", "UC Irvine", "CA"),
            new UniversityDomainMapping("ucsc.edu", "University of California, Santa Cruz", "UC Santa Cruz", "CA"),
            new UniversityDomainMapping("ucr.edu", "University of California, Riverside", "UC Riverside", "CA"),
            new UniversityDomainMapping("ucmerced.edu", "University of California, Merced", "UC Merced", "CA"),
            new UniversityDomainMapping("ucsf.edu", "University of California, San Francisco", "UCSF", "CA"),

            // Big Ten
            new UniversityDomainMapping("umich.edu", "University of Michigan", "Michigan", "MI"),
            new UniversityDomainMapping("osu.edu", "Ohio State University", "Ohio State", "OH"),
            new UniversityDomainMapping("psu.edu", "Pennsylvania State University", "Penn State", "PA"),
            new UniversityDomainMapping("wisc.edu", "University of Wisconsin-Madison", "Wisconsin", "WI"),
            new UniversityDomainMapping("umn.edu", "University of Minnesota", "Minnesota", "MN"),
            new UniversityDomainMapping("illinois.edu", "University of Illinois Urbana-Champaign", "Illinois", "IL"),
            new UniversityDomainMapping("uiuc.edu", "University of Illinois Urbana-Champaign", "UIUC", "IL"),
            new UniversityDomainMapping("purdue.edu", "Purdue University", "Purdue", "IN"),
            new UniversityDomainMapping("iu.edu", "Indiana University", "Indiana", "IN"),
            new UniversityDomainMapping("indiana.edu", "Indiana University", "Indiana", "IN"),
            new UniversityDomainMapping("umd.edu", "University of Maryland", "Maryland", "MD"),
            new UniversityDomainMapping("rutgers.edu", "Rutgers University", "Rutgers", "NJ"),
            new UniversityDomainMapping("unl.edu", "University of Nebraska-Lincoln", "Nebraska", "NE"),
            new UniversityDomainMapping("uiowa.edu", "University of Iowa", "Iowa", "IA"),
            new UniversityDomainMapping("msu.edu", "Michigan State University", "Michigan State", "MI"),

            // SEC
            new UniversityDomainMapping("ufl.edu", "University of Florida", "Florida", "FL"),
            new UniversityDomainMapping("uga.edu", "University of Georgia", "Georgia", "GA"),
            new UniversityDomainMapping("ua.edu", "University of Alabama", "Alabama", "AL"),
            new UniversityDomainMapping("bama.edu", "University of Alabama", "Alabama", "AL"),
            new UniversityDomainMapping("auburn.edu", "Auburn University", "Auburn", "AL"),
            new UniversityDomainMapping("lsu.edu", "Louisiana State University", "LSU", "LA"),
            new UniversityDomainMapping("olemiss.edu", "University of Mississippi", "Ole Miss", "MS"),
            new UniversityDomainMapping("msstate.edu", "Mississippi State University", "Miss State", "MS"),
            new UniversityDomainMapping("utk.edu", "University of Tennessee", "Tennessee", "TN"),
            new UniversityDomainMapping("uky.edu", "University of Kentucky", "Kentucky", "KY"),
            new UniversityDomainMapping("sc.edu", "University of South Carolina", "South Carolina", "SC"),
            new UniversityDomainMapping("uark.edu", "University of Arkansas", "Arkansas", "AR"),
            new UniversityDomainMapping("missouri.edu", "University of Missouri", "Mizzou", "MO"),
            new UniversityDomainMapping("tamu.edu", "Texas A&M University", "Texas A&M", "TX"),
            new UniversityDomainMapping("utexas.edu", "University of Texas at Austin", "Texas", "TX"),

            // ACC
            new UniversityDomainMapping("fsu.edu", "Florida State University", "Florida State", "FL"),
            new UniversityDomainMapping("miami.edu", "University of Miami", "Miami", "FL"),
            new UniversityDomainMapping("ncsu.edu", "North Carolina State University", "NC State", "NC"),
            new UniversityDomainMapping("unc.edu", "University of North Carolina at Chapel Hill", "UNC", "NC"),
            new UniversityDomainMapping("vt.edu", "Virginia Tech", "Virginia Tech", "VA"),
            new UniversityDomainMapping("virginia.edu", "University of Virginia", "UVA", "VA"),
            new UniversityDomainMapping("uva.edu", "University of Virginia", "UVA", "VA"),
            new UniversityDomainMapping("clemson.edu", "Clemson University", "Clemson", "SC"),
            new UniversityDomainMapping("gatech.edu", "Georgia Institute of Technology", "Georgia Tech", "GA"),
            new UniversityDomainMapping("louisville.edu", "University of Louisville", "Louisville", "KY"),
            new UniversityDomainMapping("pitt.edu", "University of Pittsburgh", "Pitt", "PA"),

            // Big 12
            new UniversityDomainMapping("ou.edu", "University of Oklahoma", "Oklahoma", "OK"),
            new UniversityDomainMapping("okstate.edu", "Oklahoma State University", "Oklahoma State", "OK"),
            new UniversityDomainMapping("ku.edu", "University of Kansas", "Kansas", "KS"),
            new UniversityDomainMapping("ksu.edu", "Kansas State University", "K-State", "KS"),
            new UniversityDomainMapping("iastate.edu", "Iowa State University", "Iowa State", "IA"),
            new UniversityDomainMapping("wvu.edu", "West Virginia University", "West Virginia", "WV"),
            new UniversityDomainMapping("ttu.edu", "Texas Tech University", "Texas Tech", "TX"),
            new UniversityDomainMapping("byu.edu", "Brigham Young University", "BYU", "UT"),
            new UniversityDomainMapping("ucf.edu", "University of Central Florida", "UCF", "FL"),
            new UniversityDomainMapping("uh.edu", "University of Houston", "Houston", "TX"),
            new UniversityDomainMapping("uc.edu", "University of Cincinnati", "Cincinnati", "OH"),

            // Pac-12 / Other West Coast
            new UniversityDomainMapping("uw.edu", "University of Washington", "Washington", "WA"),
            new UniversityDomainMapping("washington.edu", "University of Washington", "Washington", "WA"),
            new UniversityDomainMapping("oregonstate.edu", "Oregon State University", "Oregon State", "OR"),
            new UniversityDomainMapping("uoregon.edu", "University of Oregon", "Oregon", "OR"),
            new UniversityDomainMapping("wsu.edu", "Washington State University", "Washington State", "WA"),
            new UniversityDomainMapping("asu.edu", "Arizona State University", "ASU", "AZ"),
            new UniversityDomainMapping("arizona.edu", "University of Arizona", "Arizona", "AZ"),
            new UniversityDomainMapping("colorado.edu", "University of Colorado Boulder", "Colorado", "CO"),
            new UniversityDomainMapping("utah.edu", "University of Utah", "Utah", "UT"),
            new UniversityDomainMapping("colostate.edu", "Colorado State University", "Colorado State", "CO"),
            new UniversityDomainMapping("unm.edu", "University of New Mexico", "New Mexico", "NM"),
            new UniversityDomainMapping("unlv.edu", "University of Nevada, Las Vegas", "UNLV", "NV"),
            new UniversityDomainMapping("unr.edu", "University of Nevada, Reno", "Nevada", "NV"),
            new UniversityDomainMapping("sdsu.edu", "San Diego State University", "SDSU", "CA"),
            new UniversityDomainMapping("sjsu.edu", "San Jose State University", "SJSU", "CA"),
            new UniversityDomainMapping("fresnostate.edu", "Fresno State University", "Fresno State", "CA"),
            new UniversityDomainMapping("csulb.edu", "California State University, Long Beach", "CSULB", "CA"),
            new UniversityDomainMapping("csuf.edu", "California State University, Fullerton", "CSUF", "CA"),
            new UniversityDomainMapping("cpp.edu", "California State Polytechnic University, Pomona", "Cal Poly Pomona", "CA"),
            new UniversityDomainMapping("calpoly.edu", "California Polytechnic State University", "Cal Poly SLO", "CA"),

            // Other Major Public Universities
            new UniversityDomainMapping("usf.edu", "University of South Florida", "USF", "FL"),
            new UniversityDomainMapping("fiu.edu", "Florida International University", "FIU", "FL"),
            new UniversityDomainMapping("fau.edu", "Florida Atlantic University", "FAU", "FL"),
            new UniversityDomainMapping("unf.edu", "University of North Florida", "UNF", "FL"),
            new UniversityDomainMapping("uwf.edu", "University of West Florida", "UWF", "FL"),
            new UniversityDomainMapping("gsu.edu", "Georgia State University", "Georgia State", "GA"),
            new UniversityDomainMapping("kennesaw.edu", "Kennesaw State University", "Kennesaw State", "GA"),
            new UniversityDomainMapping("utdallas.edu", "University of Texas at Dallas", "UT Dallas", "TX"),
            new UniversityDomainMapping("uta.edu", "University of Texas at Arlington", "UT Arlington", "TX"),
            new UniversityDomainMapping("utsa.edu", "University of Texas at San Antonio", "UTSA", "TX"),
            new UniversityDomainMapping("utep.edu", "University of Texas at El Paso", "UTEP", "TX"),
            new UniversityDomainMapping("unt.edu", "University of North Texas", "UNT", "TX"),
            new UniversityDomainMapping("txstate.edu", "Texas State University", "Texas State", "TX"),
            new UniversityDomainMapping("uncc.edu", "University of North Carolina at Charlotte", "UNC Charlotte", "NC"),
            new UniversityDomainMapping("ecu.edu", "East Carolina University", "ECU", "NC"),
            new UniversityDomainMapping("appstate.edu", "Appalachian State University", "App State", "NC"),
            new UniversityDomainMapping("temple.edu", "Temple University", "Temple", "PA"),
            new UniversityDomainMapping("buffalo.edu", "University at Buffalo", "Buffalo", "NY"),
            new UniversityDomainMapping("stonybrook.edu", "Stony Brook University", "Stony Brook", "NY"),
            new UniversityDomainMapping("binghamton.edu", "Binghamton University", "Binghamton", "NY"),
            new UniversityDomainMapping("albany.edu", "University at Albany", "Albany", "NY"),
            new UniversityDomainMapping("uconn.edu", "University of Connecticut", "UConn", "CT"),
            new UniversityDomainMapping("uri.edu", "University of Rhode Island", "URI", "RI"),
            new UniversityDomainMapping("umass.edu", "University of Massachusetts Amherst", "UMass", "MA"),
            new UniversityDomainMapping("unh.edu", "University of New Hampshire", "UNH", "NH"),
            new UniversityDomainMapping("uvm.edu", "University of Vermont", "Vermont", "VT"),
            new UniversityDomainMapping("maine.edu", "University of Maine", "Maine", "ME"),
            new UniversityDomainMapping("udel.edu", "University of Delaware", "Delaware", "DE"),
            new UniversityDomainMapping("vcu.edu", "Virginia Commonwealth University", "VCU", "VA"),
            new UniversityDomainMapping("gmu.edu", "George Mason University", "George Mason", "VA"),
            new UniversityDomainMapping("odu.edu", "Old Dominion University", "ODU", "VA"),
            new UniversityDomainMapping("jmu.edu", "James Madison University", "JMU", "VA"),
            new UniversityDomainMapping("wm.edu", "William & Mary", "William & Mary", "VA"),

            // Tech Schools
            new UniversityDomainMapping("njit.edu", "New Jersey Institute of Technology", "NJIT", "NJ"),
            new UniversityDomainMapping("iit.edu", "Illinois Institute of Technology", "IIT", "IL"),
            new UniversityDomainMapping("mines.edu", "Colorado School of Mines", "Mines", "CO"),
            new UniversityDomainMapping("rit.edu", "Rochester Institute of Technology", "RIT", "NY"),
            new UniversityDomainMapping("fit.edu", "Florida Institute of Technology", "Florida Tech", "FL"),

            // Other Notable Schools
            new UniversityDomainMapping("unc.edu", "University of North Carolina at Chapel Hill", "UNC", "NC"),
            new UniversityDomainMapping("udayton.edu", "University of Dayton", "Dayton", "OH"),
            new UniversityDomainMapping("marquette.edu", "Marquette University", "Marquette", "WI"),
            new UniversityDomainMapping("depaul.edu", "DePaul University", "DePaul", "IL"),
            new UniversityDomainMapping("luc.edu", "Loyola University Chicago", "Loyola Chicago", "IL"),
            new UniversityDomainMapping("xavier.edu", "Xavier University", "Xavier", "OH"),
            new UniversityDomainMapping("creighton.edu", "Creighton University", "Creighton", "NE"),
            new UniversityDomainMapping("gonzaga.edu", "Gonzaga University", "Gonzaga", "WA"),
            new UniversityDomainMapping("scu.edu", "Santa Clara University", "Santa Clara", "CA"),
            new UniversityDomainMapping("sandiego.edu", "University of San Diego", "USD", "CA"),
            new UniversityDomainMapping("usfca.edu", "University of San Francisco", "USF", "CA"),
            new UniversityDomainMapping("lmu.edu", "Loyola Marymount University", "LMU", "CA"),
            new UniversityDomainMapping("pepperdine.edu", "Pepperdine University", "Pepperdine", "CA"),
            new UniversityDomainMapping("du.edu", "University of Denver", "Denver", "CO"),
            new UniversityDomainMapping("spu.edu", "Seattle Pacific University", "SPU", "WA"),
            new UniversityDomainMapping("seattleu.edu", "Seattle University", "Seattle U", "WA"),
            new UniversityDomainMapping("pdx.edu", "Portland State University", "Portland State", "OR"),
            new UniversityDomainMapping("up.edu", "University of Portland", "Portland", "OR")
        );

        for (UniversityDomainMapping mapping : mappings) {
            try {
                if (!repository.existsByDomain(mapping.getDomain())) {
                    repository.save(mapping);
                }
            } catch (Exception e) {
                logger.warn("Could not save mapping for {}: {}", mapping.getDomain(), e.getMessage());
            }
        }

        logger.info("Initialized {} university domain mappings", repository.count());
    }

    public Optional<UniversityDomainMapping> findByDomain(String domain) {
        return repository.findByDomain(domain.toLowerCase());
    }

    public String getUniversityName(String domain) {
        return findByDomain(domain)
                .map(UniversityDomainMapping::getUniversityName)
                .orElse(formatDomainAsName(domain));
    }

    public String getShortName(String domain) {
        return findByDomain(domain)
                .map(UniversityDomainMapping::getShortName)
                .orElse(formatDomainAsName(domain));
    }

    private String formatDomainAsName(String domain) {
        if (domain == null || domain.isEmpty()) {
            return "Unknown University";
        }
        String name = domain.replace(".edu", "").replace(".", " ");
        return name.substring(0, 1).toUpperCase() + name.substring(1);
    }
}
