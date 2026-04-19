"""
Fetch real university data from US College Scorecard API (US Dept of Education)
and write it as a TypeScript data file.
Source: https://collegescorecard.ed.gov/data/
API Key: DEMO_KEY (free, rate-limited)
"""
import json, time, urllib.request, urllib.error, os, sys

API_KEY = "DEMO_KEY"
BASE = "https://api.data.gov/ed/collegescorecard/v1/schools"
FIELDS = ",".join([
    "school.name", "school.city", "school.state",
    "latest.cost.tuition.out_of_state",
    "latest.admissions.admission_rate.overall",
    "latest.earnings.10_yrs_after_entry.median",
    "latest.student.size",
    "latest.cost.avg_net_price.overall",
])

# Universities we want to fetch (these are the top targets for Indian students)
US_UNIVERSITIES = [
    "Massachusetts Institute of Technology",
    "Stanford University",
    "Harvard University",
    "Carnegie Mellon University",
    "Georgia Institute of Technology",
    "University of California-Berkeley",
    "Columbia University in the City of New York",
    "New York University",
    "University of Illinois Urbana-Champaign",
    "Purdue University-Main Campus",
    "University of Southern California",
    "University of Michigan-Ann Arbor",
    "University of Texas at Austin",
    "University of California-Los Angeles",
    "University of Pennsylvania",
    "Cornell University",
    "University of Washington-Seattle Campus",
    "Northeastern University",
    "Arizona State University-Tempe",
    "University of California-San Diego",
    "Boston University",
    "University of Florida",
    "University of Wisconsin-Madison",
    "Duke University",
    "Northwestern University",
    "Johns Hopkins University",
    "Rice University",
    "University of California-Davis",
    "University of Minnesota-Twin Cities",
    "Ohio State University-Main Campus",
    "Texas A & M University-College Station",
    "Virginia Polytechnic Institute and State University",
    "University of Maryland-College Park",
    "University of North Carolina at Chapel Hill",
    "Indiana University-Bloomington",
    "Stony Brook University",
    "University at Buffalo",
    "North Carolina State University at Raleigh",
    "Rutgers University-New Brunswick",
    "University of California-Irvine",
]

results = []
for i, name in enumerate(US_UNIVERSITIES):
    url = f"{BASE}?api_key={API_KEY}&school.name={urllib.parse.quote(name)}&fields={FIELDS}"
    print(f"[{i+1}/{len(US_UNIVERSITIES)}] Fetching: {name}...", end=" ", flush=True)
    try:
        with urllib.request.urlopen(url) as resp:
            data = json.loads(resp.read().decode())
            if data.get("results"):
                r = data["results"][0]
                results.append({
                    "name": r.get("school.name", name),
                    "city": r.get("school.city", ""),
                    "state": r.get("school.state", ""),
                    "tuition": r.get("latest.cost.tuition.out_of_state"),
                    "admissionRate": r.get("latest.admissions.admission_rate.overall"),
                    "medianEarnings10yr": r.get("latest.earnings.10_yrs_after_entry.median"),
                    "studentSize": r.get("latest.student.size"),
                    "avgNetPrice": r.get("latest.cost.avg_net_price.overall"),
                    "source": "US College Scorecard API (US DOE)",
                    "sourceUrl": "https://collegescorecard.ed.gov"
                })
                print(f"OK (tuition=${r.get('latest.cost.tuition.out_of_state')})")
            else:
                print("NO RESULTS")
    except urllib.error.HTTPError as e:
        if e.code == 429:
            print(f"RATE LIMITED, waiting 60s...")
            time.sleep(60)
            # retry
            try:
                with urllib.request.urlopen(url) as resp:
                    data = json.loads(resp.read().decode())
                    if data.get("results"):
                        r = data["results"][0]
                        results.append({
                            "name": r.get("school.name", name),
                            "city": r.get("school.city", ""),
                            "state": r.get("school.state", ""),
                            "tuition": r.get("latest.cost.tuition.out_of_state"),
                            "admissionRate": r.get("latest.admissions.admission_rate.overall"),
                            "medianEarnings10yr": r.get("latest.earnings.10_yrs_after_entry.median"),
                            "studentSize": r.get("latest.student.size"),
                            "avgNetPrice": r.get("latest.cost.avg_net_price.overall"),
                            "source": "US College Scorecard API (US DOE)",
                            "sourceUrl": "https://collegescorecard.ed.gov"
                        })
                        print(f"OK (retry)")
            except Exception as e2:
                print(f"FAIL after retry: {e2}")
        else:
            print(f"ERROR: {e}")
    except Exception as e:
        print(f"ERROR: {e}")
    
    # Rate limit: DEMO_KEY allows ~30 requests/hour, so wait between requests
    time.sleep(2)

# Save raw JSON
output_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "us_universities_raw.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\n✅ Saved {len(results)} universities to {output_path}")
print(json.dumps(results[:3], indent=2))

import urllib.parse
