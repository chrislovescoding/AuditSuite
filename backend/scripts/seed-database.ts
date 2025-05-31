import { db } from '../src/database/config';
import { UserService } from '../src/services/userService';
import { UserRole, UserStatus } from '../src/models/User';

const testUsers = [
  {
    email: 'lead.auditor@audit-suite.gov.uk',
    password: 'TestPass123!',
    firstName: 'Sarah',
    lastName: 'Thompson',
    role: UserRole.LEAD_AUDITOR,
    department: 'Audit Department',
    phoneNumber: '+44 20 1234 5678'
  },
  {
    email: 'senior.auditor@audit-suite.gov.uk',
    password: 'TestPass123!',
    firstName: 'Michael',
    lastName: 'Johnson',
    role: UserRole.SENIOR_AUDITOR,
    department: 'Audit Department',
    phoneNumber: '+44 20 1234 5679'
  },
  {
    email: 'auditor@audit-suite.gov.uk',
    password: 'TestPass123!',
    firstName: 'Emily',
    lastName: 'Davis',
    role: UserRole.AUDITOR,
    department: 'Audit Department',
    phoneNumber: '+44 20 1234 5680'
  },
  {
    email: 'analyst@audit-suite.gov.uk',
    password: 'TestPass123!',
    firstName: 'David',
    lastName: 'Wilson',
    role: UserRole.ANALYST,
    department: 'Finance Department',
    phoneNumber: '+44 20 1234 5681'
  },
  {
    email: 'reviewer@external.gov.uk',
    password: 'TestPass123!',
    firstName: 'Catherine',
    lastName: 'Brown',
    role: UserRole.EXTERNAL_REVIEWER,
    department: 'External Review',
    phoneNumber: '+44 20 1234 5682'
  },
  {
    email: 'councillor@council.gov.uk',
    password: 'TestPass123!',
    firstName: 'Robert',
    lastName: 'Taylor',
    role: UserRole.COUNCILLOR,
    department: 'Council',
    phoneNumber: '+44 20 1234 5683'
  }
];

async function seedDatabase() {
  console.log('🌱 Seeding database with test data...');
  
  try {
    // Test connection
    const isConnected = await db.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    
    // Get admin user ID for created_by field
    const adminUser = await UserService.getUserByEmail('admin@audit-suite.gov.uk');
    if (!adminUser) {
      throw new Error('Admin user not found. Please run migrations first.');
    }
    
    console.log('👤 Creating test users...');
    
    // Create test users
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await UserService.getUserByEmail(userData.email);
        if (existingUser) {
          console.log(`⏭️ User ${userData.email} already exists`);
          continue;
        }
        
        // Create user
        const user = await UserService.createUser(userData, adminUser.id);
        
        // Activate the user (normally would require admin approval)
        await UserService.updateUserStatus(user.id, UserStatus.ACTIVE, adminUser.id);
        
        console.log(`✅ Created user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error);
      }
    }
    
    // Print summary
    const stats = await UserService.getUserStats();
    console.log('\n📊 Database seeding complete!');
    console.log(`
📋 User Statistics:
   Total Users: ${stats.total}
   Active Users: ${stats.active}
   Pending Approval: ${stats.pendingApproval}
   
👥 Users by Role:
   System Admin: ${stats.byRole.system_admin}
   Lead Auditor: ${stats.byRole.lead_auditor}
   Senior Auditor: ${stats.byRole.senior_auditor}
   Auditor: ${stats.byRole.auditor}
   Analyst: ${stats.byRole.analyst}
   External Reviewer: ${stats.byRole.external_reviewer}
   Councillor: ${stats.byRole.councillor}

🔑 Test Credentials:
   All test users have password: TestPass123!
   Examples:
   • lead.auditor@audit-suite.gov.uk
   • senior.auditor@audit-suite.gov.uk
   • auditor@audit-suite.gov.uk
`);
    
    // Close connection
    await db.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase(); 