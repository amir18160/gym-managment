const dotenv = require("dotenv");
const faker = require("@faker-js/faker");
const prisma = require("./src/config/prisma");
dotenv.config({ path: "./.env" });

(async function () {
    async function seedDatabase() {
        console.log("Seeding database...");

        // Seed roles
        const rolesData = ["Member", "Trainer", "Admin"].map((roleName) => ({
            role_name: roleName,
        }));
        const roles = await prisma.role.createMany({ data: rolesData });
        console.log(`Inserted ${roles.count} roles.`);

        // Seed people
        const peopleData = [];
        for (let i = 0; i < 900; i++) {
            peopleData.push({
                first_name: faker.fakerEN_US.person.firstName(),
                last_name: faker.fakerEN_US.person.lastName(),
                phone_number: faker.fakerEN_US.phone.number(),
                role_id: faker.fakerEN_US.number.int({
                    min: 1,
                    max: rolesData.length,
                }),
            });
        }
        await prisma.person.createMany({ data: peopleData });
        const people = await prisma.person.findMany();
        console.log(`Inserted ${people.length} people.`);

        // Seed employees
        const employeeData = [];
        for (let i = 0; i < 30; i++) {
            const person = faker.fakerEN_US.helpers.arrayElement(
                people.filter((p) => p.role_id === 2)
            ); // Trainers
            employeeData.push({ person_id: person.person_id });
        }
        await prisma.employee.createMany({ data: employeeData });
        const employees = await prisma.employee.findMany();
        console.log(`Inserted ${employees.length} employees.`);

        // Seed trainers
        const trainerData = employees.map((emp) => ({
            employee_id: emp.employee_id,
        }));
        await prisma.trainer.createMany({ data: trainerData });
        const trainers = await prisma.trainer.findMany();
        console.log(`Inserted ${trainers.length} trainers.`);

        // Seed halls
        const hallData = [];
        for (let i = 0; i < 10; i++) {
            hallData.push({
                hall_max_capacity: faker.fakerEN_US.number.int({
                    min: 20,
                    max: 100,
                }),
                hall_name: faker.fakerEN_US.location.streetAddress({
                    useFullAddress: true,
                }),
            });
        }
        await prisma.hall.createMany({ data: hallData });
        const halls = await prisma.hall.findMany();
        console.log(`Inserted ${halls.length} halls.`);

        // Seed plans
        const planData = [];
        for (let i = 0; i < 10; i++) {
            planData.push({
                plan_length: faker.fakerEN_US.number.int({ min: 1, max: 12 }),
                plan_price: faker.fakerEN_US.number.int({
                    min: 100,
                    max: 5000,
                }),
                has_trainer: faker.fakerEN_US.datatype.boolean({
                    probability: 0.7,
                }),
            });
        }
        await prisma.plan.createMany({ data: planData });
        const plans = await prisma.plan.findMany();
        console.log(`Inserted ${plans.length} plans.`);

        // Seed member plans
        const memberPlanData = [];
        for (let i = 0; i < 550; i++) {
            const person = faker.fakerEN_US.helpers.arrayElement(
                people.filter((p) => p.role_id === 1)
            ); // Members
            const plan = faker.fakerEN_US.helpers.arrayElement(plans);
            memberPlanData.push({
                started_at: faker.fakerEN_US.date.past({ years: 2 }),
                end_at: faker.fakerEN_US.date.future({ years: 1 }),
                person_id: person.person_id,
                plan_id: plan.plan_id,
            });
        }
        await prisma.member_plan.createMany({ data: memberPlanData });
        const memberPlans = await prisma.member_plan.findMany();
        console.log(`Inserted ${memberPlans.length} member plans.`);

        // Seed bills
        const billData = [];
        for (let i = 0; i < 400; i++) {
            const memberPlan =
                faker.fakerEN_US.helpers.arrayElement(memberPlans);
            billData.push({
                bill_value: faker.fakerEN_US.number.int({ min: 50, max: 1000 }),
                is_paid: faker.fakerEN_US.datatype.boolean({
                    probability: 0.6,
                }),
                member_plan_id: memberPlan.member_plan_id,
            });
        }
        await prisma.bill.createMany({ data: billData });
        const bills = await prisma.bill.findMany();
        console.log(`Inserted ${bills.length} bills.`);

        // Seed in_out_actions
        const inOutActionData = ["Enter", "Exit"].map((actionName) => ({
            in_out_action_name: actionName,
        }));
        await prisma.in_out_action.createMany({ data: inOutActionData });
        const inOutActions = await prisma.in_out_action.findMany();
        console.log(`Inserted ${inOutActions.length} in_out_actions.`);

        // Seed in_out_logs
        const inOutLogData = [];
        for (let i = 0; i < 1000; i++) {
            const person = faker.fakerEN_US.helpers.arrayElement(people);
            const action = faker.fakerEN_US.helpers.arrayElement(inOutActions);
            inOutLogData.push({
                time: faker.fakerEN_US.date.recent({ days: 30 }),
                person_id: person.person_id,
                int_out_action_id: action.in_out_action_id,
            });
        }
        await prisma.in_out_log.createMany({ data: inOutLogData });
        const inOutLogs = await prisma.in_out_log.findMany();
        console.log(`Inserted ${inOutLogs.length} in_out_logs.`);

        console.log("Database seeding complete.");
    }

    seedDatabase()
        .catch((err) => {
            console.error("Error seeding database:", err);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
})();
