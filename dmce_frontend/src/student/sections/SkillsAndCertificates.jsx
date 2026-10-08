import React, { useState, useEffect } from 'react';

const SkillsAndCertificates = ({ data, setData,onNext }) => {
  // Comprehensive list of programming languages categorized
  const programmingLanguages = [
    // Front-end
    "JavaScript", "TypeScript", "HTML", "CSS", "Dart", "Elm",
    "CoffeeScript", "ClojureScript", "JSX", "EJS", "Pug", "LESS", "SASS", "Stylus",
    
    // Back-end
    "Python", "Java", "Ruby", "PHP", "Go", "C#", "Rust", "Node.js", "Kotlin", 
    "Scala", "Groovy", "Perl", "Haskell", "Elixir", "Clojure", "Erlang",
    
    // Mobile
    "Swift", "Objective-C", "Kotlin", "Java", "React Native", "Flutter", "Xamarin",
    
    // Systems & Low-level
    "C", "C++", "Assembly", "Fortran", "COBOL", "Ada", "D", "Zig", "V", "Nim",
    
    // ML & Data Science
    "Python", "R", "Julia", "MATLAB", "SAS", "Scala", "OCaml", "F#", 
    "TensorFlow", "PyTorch", "Keras", "Pandas", "NumPy",
    
    // Database
    "SQL", "PL/SQL", "T-SQL", "PostgreSQL", "MySQL", "MariaDB", "SQLite", "Oracle",
    "MongoDB", "Cassandra", "Redis", "Neo4j", "GraphQL", "Cypher", "DynamoDB",
    
    // DevOps & Cloud
    "Bash", "Shell Script", "PowerShell", "HCL (Terraform)", "YAML", "Ansible",
    "Docker", "Kubernetes", "CloudFormation", "ARM Templates", "Pulumi",
    
    // Web Frameworks & Libraries
    "React", "Angular", "Vue.js", "Svelte", "Express", "Django", "Flask",
    "Spring Boot", "Laravel", "Ruby on Rails", "ASP.NET", "Next.js", "Nuxt.js",
    
    // Other
    "Lisp", "Prolog", "Lua", "Solidity", "Apex", "ABAP", "VBA", "Crystal", 
    "WebAssembly", "Delphi", "Visual Basic", "ActionScript", "ColdFusion"
  ].sort();

  // Comprehensive list of technical skills categorized
  const technicalSkills = [
    // Software Engineering
    "Data Structures", "Algorithms", "Object-Oriented Programming", "Functional Programming",
    "Design Patterns", "Software Architecture", "API Design", "System Design", 
    "Microservices", "Serverless", "RESTful Services", "GraphQL", "gRPC", "WebSockets",
    "Distributed Systems", "Concurrent Programming", "Parallel Computing",
    
    // Web Development
    "Front-end Development", "Back-end Development", "Full-stack Development",
    "Responsive Design", "Web Accessibility", "Progressive Web Apps", "Single Page Applications",
    "State Management", "Component Design", "Web Performance Optimization", "Web Security",
    "Authentication", "Authorization", "OAuth", "JWT", "SEO", "Web Analytics",
    
    // Mobile Development
    "iOS Development", "Android Development", "Cross-platform Development",
    "Mobile UI/UX", "Push Notifications", "Offline Storage", "Geolocation",
    "App Store Optimization", "Mobile Security", "Responsive Layouts",
    
    // DevOps & Infrastructure
    "CI/CD", "Infrastructure as Code", "Configuration Management", "Containerization",
    "Orchestration", "Cloud Services", "Monitoring", "Logging", "Alerting",
    "Site Reliability Engineering", "Performance Tuning", "Load Balancing", "CDN",
    "Networking", "Firewall Configuration", "VPN", "DNS Management",
    
    // Database
    "Database Design", "Query Optimization", "Indexing", "Normalization",
    "Transactions", "ACID Properties", "ORM", "Database Migration", "Data Modeling",
    "Caching Strategies", "Connection Pooling", "Sharding", "Replication",
    
    // Data Science & ML
    "Machine Learning", "Deep Learning", "Natural Language Processing",
    "Computer Vision", "Data Mining", "Statistical Analysis", "A/B Testing",
    "Feature Engineering", "Model Deployment", "Data Visualization", "Big Data",
    "ETL", "Data Warehousing", "Business Intelligence", "Predictive Analytics",
    
    // Security
    "Penetration Testing", "Security Auditing", "Vulnerability Assessment",
    "Encryption", "Secure Coding Practices", "Threat Modeling", "OWASP", "GDPR Compliance",
    "Security Architecture", "Identity Management", "Zero Trust", "Blockchain",
    
    // Soft Skills
    "Problem Solving", "Critical Thinking", "Analytical Skills", "Teamwork",
    "Communication", "Project Management", "Time Management", "Leadership",
    "Documentation", "Technical Writing", "Code Review", "Mentoring",
    
    // Tools & Platforms
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Jenkins", "CircleCI",
    "Travis CI", "GitHub Actions", "Docker", "Kubernetes", "Terraform", "AWS", "Azure", 
    "GCP", "Digital Ocean", "Heroku", "Firebase", "Vercel", "Netlify", "Cloudflare"
  ].sort();

  const [suggestions, setSuggestions] = useState({
    programming_languages: [],
    skills: []
  });
  
  // Only initialize missing fields without overriding existing parent data
  useEffect(() => {
    setData(prevData => {
      const updatedData = { ...prevData };
      
      // Only set defaults if the fields don't exist or are null/undefined
      if (updatedData.programming_languages === undefined || updatedData.programming_languages === null) {
        updatedData.programming_languages = '';
      }
      if (updatedData.skills === undefined || updatedData.skills === null) {
        updatedData.skills = '';
      }
      if (!updatedData.certifications || !Array.isArray(updatedData.certifications)) {
        updatedData.certifications = [{ name: '', link: '' }];
      }
      if (!updatedData.projects || !Array.isArray(updatedData.projects)) {
        updatedData.projects = [{ title: '', description: '', url: '' }];
      }
      
      return updatedData;
    });
  }, []); // Empty dependency array to run only once

  const getCurrentInputValue = (field) => {
    const value = data[field];
    return typeof value === 'string' ? value : '';
  };

  const getLastTypedWord = (field) => {
    const value = getCurrentInputValue(field);
    const words = value.split(',').map(word => word.trim());
    const lastWord = words[words.length - 1];
    return lastWord || '';
  };

  const fetchSuggestions = (type, value) => {
    const lastTypedWord = getLastTypedWord(type);
    
    if (lastTypedWord.length < 2) {
      setSuggestions(prev => ({ ...prev, [type]: [] }));
      return;
    }

    let filteredSuggestions = [];
    if (type === 'programming_languages') {
      filteredSuggestions = programmingLanguages.filter(
        lang => lang.toLowerCase().includes(lastTypedWord.toLowerCase())
      );
    } else if (type === 'skills') {
      filteredSuggestions = technicalSkills.filter(
        skill => skill.toLowerCase().includes(lastTypedWord.toLowerCase())
      );
    }

    // Limit to top 15 most relevant results
    filteredSuggestions = filteredSuggestions.slice(0, 15);
    setSuggestions(prev => ({ ...prev, [type]: filteredSuggestions }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'programming_languages' || name === 'skills') {
      fetchSuggestions(name, value);
    }
  };

  const handleSelectSuggestion = (field, word) => {
    const currentValue = getCurrentInputValue(field);
    const items = currentValue.split(',').map(item => item.trim()).filter(Boolean);
    
    // Replace the last item with the selected suggestion
    items.pop();
    items.push(word);
    
    // Set the updated value with a trailing comma and space
    const newValue = items.join(', ') + (items.length > 0 ? ', ' : '');
    
    setData(prev => ({ ...prev, [field]: newValue }));
    setSuggestions(prev => ({ ...prev, [field]: [] }));
  };

  const handleCertificationChange = (index, e) => {
    const certs = [...(data.certifications || [])];
    if (!certs[index]) {
      certs[index] = { name: '', link: '' };
    }
    certs[index][e.target.name] = e.target.value;
    setData(prev => ({ ...prev, certifications: certs }));
  };

  const addCertification = () => {
    const certs = data.certifications || [];
    if (certs.length < 3) {
      setData(prev => ({
        ...prev,
        certifications: [...certs, { name: '', link: '' }]
      }));
    }
  };

  const handleProjectChange = (index, e) => {
    const projects = [...(data.projects || [])];
    if (!projects[index]) {
      projects[index] = { title: '', description: '', url: '' };
    }
    projects[index][e.target.name] = e.target.value;
    setData(prev => ({ ...prev, projects }));
  };

  const addProject = () => {
    const projects = data.projects || [];
    if (projects.length < 3) {
      setData(prev => ({
        ...prev,
        projects: [...projects, { title: '', description: '', url: '' }]
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Process data into arrays before submission
    const formattedData = {
      ...data,
      programming_languages: processCsvToArray(data.programming_languages),
      skills: processCsvToArray(data.skills),
      certifications: data.certifications || [],
      projects: data.projects || []
    };
    
    alert('Skills & Certificates submitted successfully.');
    console.log('Raw data:', data);
    console.log('Formatted for DB:', formattedData);

    if (onNext) onNext();
  };

  // Helper function to process comma-separated values into array
  const processCsvToArray = (csvString) => {
    if (!csvString || typeof csvString !== 'string') return [];
    return csvString.split(',')
      .map(item => item.trim())
      .filter(Boolean); // Remove empty entries
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
    color: '#000',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
    position: 'relative'
  };

  const labelStyle = {
    marginBottom: '6px',
    fontWeight: '600',
    fontSize: '16px',
    color: '#1e1e3f'
  };

  const cardStyle = {
    backgroundColor: '#f0f4ff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 10px rgba(30, 30, 63, 0.1)',
    marginBottom: '20px'
  };

  const suggestionBoxStyle = {
    position: 'absolute',
    backgroundColor: '#1e1e3f',
    color: 'white',
    border: '1px solid #ccc',
    zIndex: 100,
    width: '100%',
    borderRadius: '6px',
    marginTop: '2px',
    maxHeight: '200px',
    overflowY: 'auto'
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#1e1e3f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px',
    transition: 'background-color 0.3s'
  };

  const renderInputWithSuggestions = (label, name, placeholder) => (
    <div style={{ position: 'relative' }}>
      <label style={labelStyle}>{label} <span style={{ color: 'red' }}>*</span></label>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={data[name] || ''}
        onChange={handleChange}
        required
        style={inputStyle}
        autoComplete="off"
      />
      <div style={{ 
        fontSize: '12px', 
        color: '#666', 
        marginTop: '4px'
      }}>
        Enter multiple items separated by commas
      </div>
      
      {/* Display tagged items below input */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '6px', 
        marginTop: '10px' 
      }}>
        {processCsvToArray(data[name]).map((item, idx) => (
          <div key={idx} style={{
            backgroundColor: '#1e1e3f',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '14px',
            display: 'inline-block'
          }}>
            {item}
          </div>
        ))}
      </div>
      
      {suggestions[name] && suggestions[name].length > 0 && (
        <div style={suggestionBoxStyle}>
          {suggestions[name].map((s, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSuggestion(name, s)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderBottom: '1px solid #333',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2d2d5f'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      background: '#fff',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      border: '1px solid #ccc',
      maxWidth: '900px',
      margin: '30px auto',
    }}>
      <div style={{
        backgroundColor: '#1e1e3f',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px 8px 0 0',
        fontSize: '18px',
        marginBottom: '25px',
        fontWeight: '600',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Skills & Certificates</span>
        
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
        {renderInputWithSuggestions("Known Programming Languages", "programming_languages", "E.g., JavaScript, Python, Java")}
        {renderInputWithSuggestions("Skills", "skills", "E.g., Data Structures, Web Development, Cloud Computing")}

        {/* Certifications Section */}
        <div>
          <label style={{ ...labelStyle, marginBottom: '12px' }}>Certifications  </label>
          {(data.certifications || []).map((cert, idx) => (
            <div key={idx} style={cardStyle}>
              <label style={labelStyle}>Certification Name</label>
              <input
                type="text"
                name="name"
                placeholder="Certification name"
                value={cert?.name || ''}
                onChange={(e) => handleCertificationChange(idx, e)}
                style={inputStyle}
              />
              <label style={{ ...labelStyle, marginTop: '12px' }}>Certification Link</label>
              <input
                type="url"
                name="link"
                placeholder="Certification URL"
                value={cert?.link || ''}
                onChange={(e) => handleCertificationChange(idx, e)}
                style={inputStyle}
              />
            </div>
          ))}
          {(data.certifications?.length || 0) < 3 && (
            <button
              type="button"
              onClick={addCertification}
              style={buttonStyle}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e1e3f'}
            >
              Add Certification
            </button>
          )}
        </div>

        {/* Projects Section */}
        <div>
          <label style={{ ...labelStyle, marginBottom: '12px' }}>Projects  </label>
          {(data.projects || []).map((project, idx) => (
            <div key={idx} style={cardStyle}>
              <label style={labelStyle}>Project Title</label>
              <input
                type="text"
                name="title"
                placeholder="Project title"
                value={project?.title || ''}
                onChange={(e) => handleProjectChange(idx, e)}
                style={inputStyle}
              />
              <label style={{ ...labelStyle, marginTop: '12px' }}>Project Description</label>
              <textarea
                name="description"
                placeholder="Brief description"
                value={project?.description || ''}
                onChange={(e) => handleProjectChange(idx, e)}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <label style={{ ...labelStyle, marginTop: '12px' }}>Project URL</label>
              <input
                type="url"
                name="url"
                placeholder="https://yourproject.com"
                value={project?.url || ''}
                onChange={(e) => handleProjectChange(idx, e)}
                style={inputStyle}
              />
            </div>
          ))}

          {(data.projects?.length || 0) < 3 && (
            <button
              type="button"
              onClick={addProject}
              style={buttonStyle}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e1e3f'}
            >
              Add Project
            </button>
          )}
        </div>

        <button
          type="submit"
          style={{
            padding: '14px',
            backgroundColor: '#1e1e3f',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '16px',
            marginTop: '10px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e1e3f'}
        >
          Save and Next
        </button>
      </form>
    </div>
  );
};

export default SkillsAndCertificates;