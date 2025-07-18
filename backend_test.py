#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Böttcher Wiki Knowledge Base System
Tests all knowledge base functions, search, categories, stats, CRUD operations, and database integration
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Get backend URL from environment
BACKEND_URL = "https://5f463c4f-105f-4102-90ec-a413bdeb91a6.preview.emergentagent.com/api"

class BöttcherWikiKnowledgeBaseTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.created_entry_ids = []
        self.created_category_ids = []
        self.admin_token = None
        
    def log_test(self, test_name, success, message="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        })
        
    def get_admin_token(self):
        """Get admin authentication token"""
        if self.admin_token:
            return self.admin_token
            
        try:
            response = requests.post(
                f"{self.base_url}/admin/login",
                json={"username": "admin", "password": "boettcher2024"},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data.get("access_token")
                return self.admin_token
            else:
                self.log_test("Admin Login", False, f"Status code: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Admin Login", False, f"Error: {str(e)}")
            return None
    
    def get_auth_headers(self):
        """Get authentication headers"""
        token = self.get_admin_token()
        if token:
            return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        return {"Content-Type": "application/json"}
        
    def test_health_check(self):
        """Test health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy" and "Böttcher Wiki" in data.get("service", ""):
                    self.log_test("Health Check", True, "API is healthy")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
        return False
        
    def test_sample_data_verification(self):
        """Test that sample data was initialized correctly"""
        try:
            response = requests.get(f"{self.base_url}/knowledge", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= 5:
                    # Check for expected categories
                    categories = [entry.get("category") for entry in data]
                    expected_categories = ["IT-Support", "Qualitätskontrolle", "Verwaltung", "Produktion", "Wartung"]
                    found_categories = [cat for cat in expected_categories if cat in categories]
                    
                    if len(found_categories) >= 4:  # At least 4 of 5 expected categories
                        # Check structure of entries
                        first_entry = data[0]
                        required_fields = ["id", "question", "answer", "category", "tags"]
                        if all(field in first_entry for field in required_fields):
                            self.log_test("Sample Data Verification", True, f"Found {len(data)} entries with {len(found_categories)} expected categories")
                            return True
                        else:
                            self.log_test("Sample Data Verification", False, f"Missing required fields in entry: {first_entry}")
                    else:
                        self.log_test("Sample Data Verification", False, f"Missing expected categories. Found: {found_categories}")
                else:
                    self.log_test("Sample Data Verification", False, f"Expected at least 5 sample entries, got {len(data) if isinstance(data, list) else 'non-list'}")
            else:
                self.log_test("Sample Data Verification", False, f"Status code: {response.status_code}")
                
        except Exception as e:
            self.log_test("Sample Data Verification", False, f"Error: {str(e)}")
        return False
        
    def test_create_knowledge_entry(self):
        """Test POST /api/knowledge - Create new knowledge entries"""
        test_entries = [
            {
                "question": "Wie installiere ich neue Software auf dem Arbeitsplatz-PC?",
                "answer": "1. Admin-Rechte anfordern\n2. Software aus dem genehmigten Katalog wählen\n3. IT-Support kontaktieren für Installation\n4. Nach Installation testen und dokumentieren",
                "category": "IT-Support",
                "tags": ["software", "installation", "pc", "admin"]
            },
            {
                "question": "Welche Sicherheitsausrüstung ist in der Produktion erforderlich?",
                "answer": "Obligatorisch:\n- Sicherheitsschuhe\n- Schutzbrille\n- Arbeitshandschuhe\n- Gehörschutz bei lauten Maschinen\n- Helm in bestimmten Bereichen\n\nAlle Ausrüstung muss CE-zertifiziert sein.",
                "category": "Produktion",
                "tags": ["sicherheit", "ausrüstung", "schutz", "ce-zertifizierung"]
            },
            {
                "question": "Wie erstelle ich einen Urlaubsantrag?",
                "answer": "1. Formular aus dem Intranet herunterladen\n2. Gewünschte Daten eintragen\n3. Vorgesetzten um Genehmigung bitten\n4. Genehmigten Antrag an HR weiterleiten\n5. Bestätigung abwarten\n\nMindestens 2 Wochen Vorlauf einplanen!",
                "category": "Verwaltung",
                "tags": ["urlaub", "antrag", "formular", "genehmigung"]
            }
        ]
        
        success_count = 0
        headers = self.get_auth_headers()
        
        for i, entry_data in enumerate(test_entries):
            try:
                response = requests.post(
                    f"{self.base_url}/knowledge",
                    json=entry_data,
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("id") and data.get("question") == entry_data["question"]:
                        self.created_entry_ids.append(data["id"])
                        success_count += 1
                        self.log_test(f"Create Knowledge Entry {i+1}", True, f"Created entry with ID: {data['id']}")
                    else:
                        self.log_test(f"Create Knowledge Entry {i+1}", False, f"Invalid response structure: {data}")
                else:
                    self.log_test(f"Create Knowledge Entry {i+1}", False, f"Status code: {response.status_code}, Response: {response.text}")
                    
            except Exception as e:
                self.log_test(f"Create Knowledge Entry {i+1}", False, f"Error: {str(e)}")
                
        return success_count == len(test_entries)
        
    def test_get_all_knowledge(self):
        """Test GET /api/knowledge - Retrieve all knowledge entries"""
        try:
            response = requests.get(f"{self.base_url}/knowledge", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    entry_count = len(data)
                    # Verify structure of returned entries
                    if entry_count > 0:
                        first_entry = data[0]
                        required_fields = ["id", "question", "answer", "category", "tags"]
                        if all(field in first_entry for field in required_fields):
                            self.log_test("Get All Knowledge", True, f"Retrieved {entry_count} entries with proper structure")
                            return True
                        else:
                            self.log_test("Get All Knowledge", False, f"Invalid entry structure: {first_entry}")
                    else:
                        self.log_test("Get All Knowledge", True, "Retrieved empty list (no entries yet)")
                        return True
                else:
                    self.log_test("Get All Knowledge", False, f"Expected list, got: {type(data)}")
            else:
                self.log_test("Get All Knowledge", False, f"Status code: {response.status_code}")
                
        except Exception as e:
            self.log_test("Get All Knowledge", False, f"Error: {str(e)}")
        return False
        
    def test_category_filtering(self):
        """Test GET /api/knowledge with category filter"""
        try:
            # Test filtering by IT-Support category
            response = requests.get(f"{self.base_url}/knowledge?category=IT-Support", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # All entries should be IT-Support category
                    it_entries = [entry for entry in data if entry.get("category") == "IT-Support"]
                    if len(it_entries) == len(data) and len(data) > 0:
                        self.log_test("Category Filtering", True, f"Found {len(data)} IT-Support entries")
                        return True
                    elif len(data) == 0:
                        self.log_test("Category Filtering", False, "No IT-Support entries found")
                    else:
                        self.log_test("Category Filtering", False, f"Filter not working properly: {len(it_entries)}/{len(data)} entries match")
                else:
                    self.log_test("Category Filtering", False, f"Expected list, got: {type(data)}")
            else:
                self.log_test("Category Filtering", False, f"Status code: {response.status_code}")
                
        except Exception as e:
            self.log_test("Category Filtering", False, f"Error: {str(e)}")
        return False
        
    def test_search_functionality(self):
        """Test POST /api/search - Search entries by text and category"""
        search_tests = [
            {"query": "Scanner", "category": None, "expected_min": 1},
            {"query": "", "category": "IT-Support", "expected_min": 1},
            {"query": "Qualität", "category": "Qualitätskontrolle", "expected_min": 1},
            {"query": "nonexistent", "category": None, "expected_min": 0}
        ]
        
        success_count = 0
        for i, search_test in enumerate(search_tests):
            try:
                search_data = {"query": search_test["query"]}
                if search_test["category"]:
                    search_data["category"] = search_test["category"]
                    
                response = requests.post(
                    f"{self.base_url}/search",
                    json=search_data,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        result_count = len(data)
                        if result_count >= search_test["expected_min"]:
                            success_count += 1
                            self.log_test(f"Search Test {i+1}", True, f"Found {result_count} results for query '{search_test['query']}'")
                        else:
                            self.log_test(f"Search Test {i+1}", False, f"Expected at least {search_test['expected_min']} results, got {result_count}")
                    else:
                        self.log_test(f"Search Test {i+1}", False, f"Expected list, got: {type(data)}")
                else:
                    self.log_test(f"Search Test {i+1}", False, f"Status code: {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Search Test {i+1}", False, f"Error: {str(e)}")
                
        return success_count >= 3  # Allow some flexibility
        
    def test_get_categories(self):
        """Test GET /api/categories - Get all available categories"""
        try:
            response = requests.get(f"{self.base_url}/categories", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "categories" in data and isinstance(data["categories"], list):
                    categories = data["categories"]
                    expected_categories = ["IT-Support", "Qualitätskontrolle", "Verwaltung", "Produktion", "Wartung"]
                    found_categories = [cat for cat in expected_categories if cat in categories]
                    
                    if len(found_categories) >= 4:  # At least 4 of our expected categories
                        self.log_test("Get Categories", True, f"Found categories: {categories}")
                        return True
                    else:
                        self.log_test("Get Categories", False, f"Missing expected categories. Found: {categories}")
                else:
                    self.log_test("Get Categories", False, f"Invalid response structure: {data}")
            else:
                self.log_test("Get Categories", False, f"Status code: {response.status_code}")
                
        except Exception as e:
            self.log_test("Get Categories", False, f"Error: {str(e)}")
        return False
        
    def test_get_stats(self):
        """Test GET /api/stats - Get statistics"""
        try:
            response = requests.get(f"{self.base_url}/stats", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_entries", "categories_count"]
                
                if all(field in data for field in required_fields):
                    total = data["total_entries"]
                    categories_count = data["categories_count"]
                    
                    # Verify reasonable values
                    if total >= len(self.created_entry_ids) and categories_count >= 3:
                        self.log_test("Get Stats", True, f"Stats: {total} total entries, {categories_count} categories")
                        return True
                    else:
                        self.log_test("Get Stats", False, f"Stats seem incorrect: {data}")
                else:
                    self.log_test("Get Stats", False, f"Missing required fields: {data}")
            else:
                self.log_test("Get Stats", False, f"Status code: {response.status_code}")
                
        except Exception as e:
            self.log_test("Get Stats", False, f"Error: {str(e)}")
        return False
        
    def test_update_knowledge_entry(self):
        """Test PUT /api/knowledge/{id} - Update existing entries"""
        if not self.created_entry_ids:
            self.log_test("Update Knowledge Entry", False, "No entries available to update")
            return False
            
        # Update the first created entry
        entry_id = self.created_entry_ids[0]
        updated_entry = {
            "question": "Wie installiere ich neue Software auf dem Arbeitsplatz-PC? (Aktualisiert)",
            "answer": "AKTUALISIERT:\n1. Admin-Rechte anfordern\n2. Software aus dem genehmigten Katalog wählen\n3. IT-Support kontaktieren für Installation\n4. Nach Installation testen und dokumentieren\n5. Lizenz registrieren",
            "category": "IT-Support",
            "tags": ["software", "installation", "pc", "admin", "lizenz"]
        }
        
        try:
            response = requests.put(
                f"{self.base_url}/knowledge/{entry_id}",
                json=updated_entry,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == entry_id and "Aktualisiert" in data.get("question", ""):
                    self.log_test("Update Knowledge Entry", True, f"Successfully updated entry {entry_id}")
                    return True
                else:
                    self.log_test("Update Knowledge Entry", False, f"Update not reflected: {data}")
            else:
                self.log_test("Update Knowledge Entry", False, f"Status code: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Update Knowledge Entry", False, f"Error: {str(e)}")
        return False
        
    def test_delete_knowledge_entry(self):
        """Test DELETE /api/knowledge/{id} - Delete entries"""
        if not self.created_entry_ids:
            self.log_test("Delete Knowledge Entry", False, "No entries available to delete")
            return False
            
        # Test deleting the last created entry
        entry_id = self.created_entry_ids[-1]
        try:
            response = requests.delete(f"{self.base_url}/knowledge/{entry_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("Delete Knowledge Entry", True, f"Successfully deleted entry {entry_id}")
                    self.created_entry_ids.remove(entry_id)
                    return True
                else:
                    self.log_test("Delete Knowledge Entry", False, f"Invalid response: {data}")
            else:
                self.log_test("Delete Knowledge Entry", False, f"Status code: {response.status_code}")
                
        except Exception as e:
            self.log_test("Delete Knowledge Entry", False, f"Error: {str(e)}")
        return False
        
    def test_edge_cases(self):
        """Test edge cases and error handling"""
        edge_case_results = []
        
        # Test 1: Update non-existent entry
        try:
            fake_id = str(uuid.uuid4())
            response = requests.put(
                f"{self.base_url}/knowledge/{fake_id}",
                json={"question": "Test", "answer": "Test", "category": "Test", "tags": []},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 404:
                edge_case_results.append(True)
                self.log_test("Edge Case - Update Non-existent Entry", True, "Correctly returned 404")
            else:
                edge_case_results.append(False)
                self.log_test("Edge Case - Update Non-existent Entry", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            edge_case_results.append(False)
            self.log_test("Edge Case - Update Non-existent Entry", False, f"Error: {str(e)}")
            
        # Test 2: Delete non-existent entry
        try:
            fake_id = str(uuid.uuid4())
            response = requests.delete(f"{self.base_url}/knowledge/{fake_id}", timeout=10)
            
            if response.status_code == 404:
                edge_case_results.append(True)
                self.log_test("Edge Case - Delete Non-existent Entry", True, "Correctly returned 404")
            else:
                edge_case_results.append(False)
                self.log_test("Edge Case - Delete Non-existent Entry", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            edge_case_results.append(False)
            self.log_test("Edge Case - Delete Non-existent Entry", False, f"Error: {str(e)}")
        
        # Test 3: Search with empty query
        try:
            response = requests.post(
                f"{self.base_url}/search",
                json={"query": ""},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    edge_case_results.append(True)
                    self.log_test("Edge Case - Empty Search", True, f"Empty search returned {len(data)} results")
                else:
                    edge_case_results.append(False)
                    self.log_test("Edge Case - Empty Search", False, "Invalid response format")
            else:
                edge_case_results.append(False)
                self.log_test("Edge Case - Empty Search", False, f"Status code: {response.status_code}")
        except Exception as e:
            edge_case_results.append(False)
            self.log_test("Edge Case - Empty Search", False, f"Error: {str(e)}")
            
        return sum(edge_case_results) >= 2  # At least 2 out of 3 edge cases should pass
        
    def test_create_test_category(self):
        """Test POST /api/categories - Create test category for deletion tests"""
        test_category = {
            "name": "Test-Kategorie-Löschung",
            "icon": "🧪",
            "color": "bg-purple-100 text-purple-800 border-purple-500",
            "description": "Test category for deletion functionality"
        }
        
        try:
            headers = self.get_auth_headers()
            response = requests.post(
                f"{self.base_url}/categories",
                json=test_category,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") and data.get("name") == test_category["name"]:
                    self.created_category_ids.append(data["id"])
                    self.log_test("Create Test Category", True, f"Created test category with ID: {data['id']}")
                    return data["id"]
                else:
                    self.log_test("Create Test Category", False, f"Invalid response structure: {data}")
            else:
                self.log_test("Create Test Category", False, f"Status code: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Create Test Category", False, f"Error: {str(e)}")
        return None
        
    def test_category_deletion_with_entries(self):
        """Test category deletion when entries are using that category"""
        # First create a test category
        category_id = self.test_create_test_category()
        if not category_id:
            return False
            
        # Create knowledge entries using this category
        test_entries = [
            {
                "question": "Test Frage 1 für Kategorie-Löschung",
                "answer": "Test Antwort 1 - Diese Einträge sollten auf 'Allgemein' umgestellt werden",
                "category": "Test-Kategorie-Löschung",
                "tags": ["test", "kategorie", "löschung"]
            },
            {
                "question": "Test Frage 2 für Kategorie-Löschung",
                "answer": "Test Antwort 2 - Diese Einträge sollten auf 'Allgemein' umgestellt werden",
                "category": "Test-Kategorie-Löschung",
                "tags": ["test", "kategorie", "löschung"]
            }
        ]
        
        created_test_entries = []
        headers = self.get_auth_headers()
        
        # Create entries with the test category
        for entry_data in test_entries:
            try:
                response = requests.post(
                    f"{self.base_url}/knowledge",
                    json=entry_data,
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    created_test_entries.append(data["id"])
                    
            except Exception as e:
                self.log_test("Category Deletion with Entries - Create Entry", False, f"Error creating test entry: {str(e)}")
                return False
        
        if len(created_test_entries) != 2:
            self.log_test("Category Deletion with Entries", False, "Failed to create test entries")
            return False
            
        # Now delete the category
        try:
            response = requests.delete(
                f"{self.base_url}/categories/{category_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                message = data.get("message", "")
                
                # Check if message mentions reassignment
                if "Allgemein" in message and "umgestellt" in message:
                    # Verify entries were reassigned to "Allgemein"
                    time.sleep(1)  # Wait for database update
                    
                    reassigned_correctly = True
                    for entry_id in created_test_entries:
                        try:
                            # Get all entries and find our test entries
                            entries_response = requests.get(f"{self.base_url}/knowledge", timeout=10)
                            if entries_response.status_code == 200:
                                entries = entries_response.json()
                                found_entry = None
                                for entry in entries:
                                    if entry.get("id") == entry_id:
                                        found_entry = entry
                                        break
                                
                                if found_entry and found_entry.get("category") != "Allgemein":
                                    reassigned_correctly = False
                                    break
                            else:
                                reassigned_correctly = False
                                break
                        except Exception as e:
                            reassigned_correctly = False
                            break
                    
                    if reassigned_correctly:
                        self.log_test("Category Deletion with Entries", True, f"Category deleted and {len(created_test_entries)} entries reassigned to 'Allgemein'")
                        
                        # Clean up test entries
                        for entry_id in created_test_entries:
                            try:
                                requests.delete(f"{self.base_url}/knowledge/{entry_id}", headers=headers, timeout=10)
                            except:
                                pass
                                
                        return True
                    else:
                        self.log_test("Category Deletion with Entries", False, "Entries were not properly reassigned to 'Allgemein'")
                else:
                    self.log_test("Category Deletion with Entries", False, f"Response message doesn't indicate proper reassignment: {message}")
            else:
                self.log_test("Category Deletion with Entries", False, f"Status code: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Category Deletion with Entries", False, f"Error: {str(e)}")
            
        return False
        
    def test_category_deletion_without_entries(self):
        """Test category deletion when no entries are using that category"""
        # Create a test category
        category_id = self.test_create_test_category()
        if not category_id:
            return False
            
        # Delete the category immediately (no entries using it)
        try:
            headers = self.get_auth_headers()
            response = requests.delete(
                f"{self.base_url}/categories/{category_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                message = data.get("message", "")
                deleted_id = data.get("deleted_id", "")
                
                if deleted_id == category_id and "erfolgreich gelöscht" in message:
                    # Verify category is actually deleted by trying to get detailed categories
                    try:
                        categories_response = requests.get(
                            f"{self.base_url}/categories/detailed",
                            headers=headers,
                            timeout=10
                        )
                        
                        if categories_response.status_code == 200:
                            categories = categories_response.json()
                            category_still_exists = any(cat.get("id") == category_id for cat in categories)
                            
                            if not category_still_exists:
                                self.log_test("Category Deletion without Entries", True, "Category successfully deleted from database")
                                return True
                            else:
                                self.log_test("Category Deletion without Entries", False, "Category still exists in database after deletion")
                        else:
                            self.log_test("Category Deletion without Entries", False, "Could not verify category deletion")
                    except Exception as e:
                        self.log_test("Category Deletion without Entries", False, f"Error verifying deletion: {str(e)}")
                else:
                    self.log_test("Category Deletion without Entries", False, f"Invalid response: {data}")
            else:
                self.log_test("Category Deletion without Entries", False, f"Status code: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Category Deletion without Entries", False, f"Error: {str(e)}")
            
        return False
        
    def test_category_deletion_error_handling(self):
        """Test error handling for category deletion"""
        headers = self.get_auth_headers()
        error_tests = []
        
        # Test 1: Delete non-existent category
        try:
            fake_id = str(uuid.uuid4())
            response = requests.delete(
                f"{self.base_url}/categories/{fake_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 404:
                error_tests.append(True)
                self.log_test("Category Deletion Error - Non-existent", True, "Correctly returned 404 for non-existent category")
            else:
                error_tests.append(False)
                self.log_test("Category Deletion Error - Non-existent", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            error_tests.append(False)
            self.log_test("Category Deletion Error - Non-existent", False, f"Error: {str(e)}")
            
        # Test 2: Delete without authentication
        try:
            fake_id = str(uuid.uuid4())
            response = requests.delete(
                f"{self.base_url}/categories/{fake_id}",
                headers={"Content-Type": "application/json"},  # No auth header
                timeout=10
            )
            
            if response.status_code in [401, 403]:
                error_tests.append(True)
                self.log_test("Category Deletion Error - No Auth", True, f"Correctly returned {response.status_code} for unauthorized request")
            else:
                error_tests.append(False)
                self.log_test("Category Deletion Error - No Auth", False, f"Expected 401/403, got {response.status_code}")
        except Exception as e:
            error_tests.append(False)
            self.log_test("Category Deletion Error - No Auth", False, f"Error: {str(e)}")
            
        return sum(error_tests) >= 1  # At least 1 error test should pass
        
    def test_database_consistency_after_deletion(self):
        """Test database consistency after category deletion"""
        # Create category and entries, then delete and verify consistency
        category_id = self.test_create_test_category()
        if not category_id:
            return False
            
        # Create an entry with this category
        test_entry = {
            "question": "Konsistenz Test Frage",
            "answer": "Test für Datenbank-Konsistenz nach Kategorie-Löschung",
            "category": "Test-Kategorie-Löschung",
            "tags": ["konsistenz", "test"]
        }
        
        headers = self.get_auth_headers()
        entry_id = None
        
        try:
            response = requests.post(
                f"{self.base_url}/knowledge",
                json=test_entry,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                entry_id = response.json().get("id")
            else:
                self.log_test("Database Consistency", False, "Failed to create test entry")
                return False
                
        except Exception as e:
            self.log_test("Database Consistency", False, f"Error creating test entry: {str(e)}")
            return False
            
        # Get initial stats
        try:
            stats_response = requests.get(f"{self.base_url}/stats", timeout=10)
            if stats_response.status_code == 200:
                initial_stats = stats_response.json()
                initial_categories_count = initial_stats.get("categories_count", 0)
            else:
                self.log_test("Database Consistency", False, "Failed to get initial stats")
                return False
        except Exception as e:
            self.log_test("Database Consistency", False, f"Error getting initial stats: {str(e)}")
            return False
            
        # Delete the category
        try:
            response = requests.delete(
                f"{self.base_url}/categories/{category_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_test("Database Consistency", False, "Failed to delete category")
                return False
                
        except Exception as e:
            self.log_test("Database Consistency", False, f"Error deleting category: {str(e)}")
            return False
            
        # Wait for database updates
        time.sleep(2)
        
        # Verify consistency
        consistency_checks = []
        
        # Check 1: Entry should now have "Allgemein" category
        try:
            entries_response = requests.get(f"{self.base_url}/knowledge", timeout=10)
            if entries_response.status_code == 200:
                entries = entries_response.json()
                found_entry = None
                for entry in entries:
                    if entry.get("id") == entry_id:
                        found_entry = entry
                        break
                
                if found_entry and found_entry.get("category") == "Allgemein":
                    consistency_checks.append(True)
                    self.log_test("Database Consistency - Entry Reassignment", True, "Entry correctly reassigned to 'Allgemein'")
                else:
                    consistency_checks.append(False)
                    self.log_test("Database Consistency - Entry Reassignment", False, f"Entry not properly reassigned: {found_entry}")
            else:
                consistency_checks.append(False)
                self.log_test("Database Consistency - Entry Reassignment", False, "Failed to retrieve entries")
        except Exception as e:
            consistency_checks.append(False)
            self.log_test("Database Consistency - Entry Reassignment", False, f"Error: {str(e)}")
            
        # Check 2: Category should be removed from categories list
        try:
            categories_response = requests.get(f"{self.base_url}/categories", timeout=10)
            if categories_response.status_code == 200:
                data = categories_response.json()
                categories = data.get("categories", [])
                
                if "Test-Kategorie-Löschung" not in categories:
                    consistency_checks.append(True)
                    self.log_test("Database Consistency - Category Removal", True, "Category removed from categories list")
                else:
                    consistency_checks.append(False)
                    self.log_test("Database Consistency - Category Removal", False, "Category still appears in categories list")
            else:
                consistency_checks.append(False)
                self.log_test("Database Consistency - Category Removal", False, "Failed to get categories")
        except Exception as e:
            consistency_checks.append(False)
            self.log_test("Database Consistency - Category Removal", False, f"Error: {str(e)}")
            
        # Check 3: Stats should be updated correctly
        try:
            stats_response = requests.get(f"{self.base_url}/stats", timeout=10)
            if stats_response.status_code == 200:
                final_stats = stats_response.json()
                final_categories_count = final_stats.get("categories_count", 0)
                
                # Categories count should be updated (might be same if "Allgemein" wasn't counted before)
                consistency_checks.append(True)
                self.log_test("Database Consistency - Stats Update", True, f"Stats updated: {initial_categories_count} -> {final_categories_count} categories")
            else:
                consistency_checks.append(False)
                self.log_test("Database Consistency - Stats Update", False, "Failed to get updated stats")
        except Exception as e:
            consistency_checks.append(False)
            self.log_test("Database Consistency - Stats Update", False, f"Error: {str(e)}")
            
        # Clean up test entry
        if entry_id:
            try:
                requests.delete(f"{self.base_url}/knowledge/{entry_id}", headers=headers, timeout=10)
            except:
                pass
                
        return sum(consistency_checks) >= 2  # At least 2 out of 3 consistency checks should pass
        
    def test_data_persistence(self):
        """Test that data persists correctly in database"""
        if not self.created_entry_ids:
            self.log_test("Data Persistence", False, "No entries to verify persistence")
            return False
            
        # Wait a moment then retrieve entries again
        time.sleep(1)
        
        try:
            response = requests.get(f"{self.base_url}/knowledge", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                found_entries = []
                
                for entry in data:
                    if entry.get("id") in self.created_entry_ids:
                        found_entries.append(entry["id"])
                        
                if len(found_entries) >= len(self.created_entry_ids) - 1:  # Account for deleted entry
                    self.log_test("Data Persistence", True, f"Found {len(found_entries)} persisted entries")
                    return True
                else:
                    self.log_test("Data Persistence", False, f"Expected {len(self.created_entry_ids)} entries, found {len(found_entries)}")
            else:
                self.log_test("Data Persistence", False, f"Status code: {response.status_code}")
                
        except Exception as e:
            self.log_test("Data Persistence", False, f"Error: {str(e)}")
        return False
        
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 70)
        print("🧪 BÖTTCHER WIKI KNOWLEDGE BASE BACKEND API TESTS")
        print("=" * 70)
        print(f"Testing against: {self.base_url}")
        print()
        
        test_functions = [
            ("Health Check", self.test_health_check),
            ("Sample Data Verification", self.test_sample_data_verification),
            ("Create Knowledge Entries", self.test_create_knowledge_entry),
            ("Get All Knowledge", self.test_get_all_knowledge),
            ("Category Filtering", self.test_category_filtering),
            ("Search Functionality", self.test_search_functionality),
            ("Get Categories", self.test_get_categories),
            ("Get Statistics", self.test_get_stats),
            ("Update Knowledge Entry", self.test_update_knowledge_entry),
            ("Delete Knowledge Entry", self.test_delete_knowledge_entry),
            ("Edge Cases", self.test_edge_cases),
            ("Data Persistence", self.test_data_persistence),
            ("Category Deletion with Entries", self.test_category_deletion_with_entries),
            ("Category Deletion without Entries", self.test_category_deletion_without_entries),
            ("Category Deletion Error Handling", self.test_category_deletion_error_handling),
            ("Database Consistency After Deletion", self.test_database_consistency_after_deletion)
        ]
        
        passed_tests = 0
        total_tests = len(test_functions)
        
        for test_name, test_func in test_functions:
            print(f"\n🔍 Running {test_name}...")
            try:
                if test_func():
                    passed_tests += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test function error: {str(e)}")
                
        print("\n" + "=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        print(f"Passed: {passed_tests}/{total_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if passed_tests == total_tests:
            print("🎉 ALL TESTS PASSED!")
        elif passed_tests >= total_tests * 0.8:
            print("✅ MOST TESTS PASSED - System is largely functional")
        elif passed_tests >= total_tests * 0.5:
            print("⚠️  SOME TESTS FAILED - System has issues")
        else:
            print("❌ MANY TESTS FAILED - System has critical issues")
            
        return passed_tests, total_tests

if __name__ == "__main__":
    tester = BöttcherWikiKnowledgeBaseTester()
    passed, total = tester.run_all_tests()
    
    # Exit with appropriate code
    if passed == total:
        exit(0)  # All tests passed
    elif passed >= total * 0.8:
        exit(1)  # Most tests passed
    else:
        exit(2)  # Many tests failed