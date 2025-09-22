# 1.0.0 (2025-09-22)


### Bug Fixes

* **app:** update release configuration and add commit message linting ([46403c3](https://github.com/NelakaWith/gloire-road-map/commit/46403c38392a976b7214ef64f4c4d299611f75e4))
* remove develop branch from deploy workflow trigger ([5039c24](https://github.com/NelakaWith/gloire-road-map/commit/5039c24ece7b5507239d7b4a0162542b6dde601e))
* update API proxy port in Vite configuration from 3001 to 3005 ([2d2839a](https://github.com/NelakaWith/gloire-road-map/commit/2d2839a00f9cd5fb9aaefa89f34381c5734be0d6))
* update backend deploy script to use server.js and add NGINX configuration ([bd3c67f](https://github.com/NelakaWith/gloire-road-map/commit/bd3c67f497d5a1b3f75b5e3694339ab7b84abfc2))
* update bcrypt dependency version to 5.1.1 and configure CORS with origin and credentials ([b2f4fce](https://github.com/NelakaWith/gloire-road-map/commit/b2f4fce6c9e8e3250487d42b4417e749d18480bf))
* update database migration script path in deploy workflow ([51bcd19](https://github.com/NelakaWith/gloire-road-map/commit/51bcd1992474f6dcb4559fcd46dc731f62c6b699))
* update error messages for user registration and login endpoints ([cac68ce](https://github.com/NelakaWith/gloire-road-map/commit/cac68ce6ceb30ff0f0ffb0ab65d87c23963f3df3))


### Features

* add ConfirmDialog component and integrate delete confirmation in GoalListView and StudentListView ([9f1b0c6](https://github.com/NelakaWith/gloire-road-map/commit/9f1b0c64fe84662a219fe1f4f2e0758ac8882fa1))
* add default admin login credentials to README and implement Menubar in MainLayout ([10dda0d](https://github.com/NelakaWith/gloire-road-map/commit/10dda0dcb9c7583078114e1a22b052976f05a053))
* add delete button for goals in GoalListView and update button text for marking goals as done ([7270328](https://github.com/NelakaWith/gloire-road-map/commit/7270328bedc30e0e8d82fd7aaac7d942e22442f3))
* add GitHub Actions workflow for deploying to DigitalOcean and create new database migration script ([ecf7a05](https://github.com/NelakaWith/gloire-road-map/commit/ecf7a050816ed9edde905e19e1a0d19a2122b790))
* add initial database migration script for goals, students, and users tables ([e977cb0](https://github.com/NelakaWith/gloire-road-map/commit/e977cb07c8d01999055c5c3e56a982e14da7ef34))
* add naive-ui as a UI component library ([eff1877](https://github.com/NelakaWith/gloire-road-map/commit/eff187736bde7b5dd7b980c7caab50b8d0169ffd))
* add PageHeader component for consistent header layout in GoalListView and MemberListView ([ab34107](https://github.com/NelakaWith/gloire-road-map/commit/ab34107d2bd9b90a8003ebdbc10601d7dee67627))
* add release workflow and configuration for semantic-release ([0f30e7c](https://github.com/NelakaWith/gloire-road-map/commit/0f30e7c8b199e9dfd3956c353ba0c813dc086105))
* add scrollable panel style to GoalListView and MemberListView for improved UI ([b248119](https://github.com/NelakaWith/gloire-road-map/commit/b2481199ddad2a9c80243a13a071232248b9be40))
* add SQL schema and seed for users, students, and goals tables ([7b1a52f](https://github.com/NelakaWith/gloire-road-map/commit/7b1a52ff33e1692fd53e529b8469fdf5ccdfdebd))
* add StudentListView and GoalListView components with routing updates ([c720b2d](https://github.com/NelakaWith/gloire-road-map/commit/c720b2d9b04ef9cdf890905b0de0869409bbf6df))
* add Vuetify as a UI component library ([8e56fb2](https://github.com/NelakaWith/gloire-road-map/commit/8e56fb27e989c671aa0131138887ed663f1c4e7b))
* enhance authentication flow by validating user token on app startup and improving navigation guard logic ([e3f9f51](https://github.com/NelakaWith/gloire-road-map/commit/e3f9f517e904675816f0318c3e3c223ecd1904f3))
* enhance goal creation and update to handle optional description and target date ([6c905f5](https://github.com/NelakaWith/gloire-road-map/commit/6c905f5bfa48f4b1eac2b1dc5f3c718de5cb9e25))
* enhance goal management with reopen functionality and update markGoalDone logic ([65ef5c8](https://github.com/NelakaWith/gloire-road-map/commit/65ef5c821fafc9e97d146057c06d43a9849dc334))
* enhance GoalModal with improved form handling and validation; update GoalListView and StudentListView for better modal integration ([fecdb89](https://github.com/NelakaWith/gloire-road-map/commit/fecdb8962c4d836d6b1867c6d494f28b01693a5c))
* enhance goals management by adding description, target date, and updating goal modal for CRUD operations ([955c76f](https://github.com/NelakaWith/gloire-road-map/commit/955c76fb85918d37cfc16564d89af5cd875fc201))
* enhance LoginView styling and improve error message display ([b66a830](https://github.com/NelakaWith/gloire-road-map/commit/b66a8306dc7df337418c45416490b141f0d96630))
* implement AppHeader component for navigation and user actions; refactor MainLayout to use AppHeader ([b92bf41](https://github.com/NelakaWith/gloire-road-map/commit/b92bf41d9aa47bc8286f473649e219c7200fcfa1))
* implement Auth and Main layouts with routing and dashboard view ([05de535](https://github.com/NelakaWith/gloire-road-map/commit/05de5357bd1f357c69a089a12b9e1541d059b00f))
* implement authHeader utility for consistent authorization headers across API calls ([8a35379](https://github.com/NelakaWith/gloire-road-map/commit/8a35379307b3af5e084ba53b96d356db7dc622f3))
* implement EditMemberModal component and integrate it into StudentListView for editing members ([b639f60](https://github.com/NelakaWith/gloire-road-map/commit/b639f604aded5e463cea64593ba7c42254f8b498))
* implement logout confirmation dialog in StudentListView and clean up login action ([069d325](https://github.com/NelakaWith/gloire-road-map/commit/069d32569f61052ab46df8271e789da31d826a28))
* initialize frontend with Vue 3, Vite, and Pinia; add authentication and student management features ([c57ba3c](https://github.com/NelakaWith/gloire-road-map/commit/c57ba3ccdc1a2f1282167f82eb9c875664d14aec))
* integrate ConfirmDialog component for goal and member deletion confirmation ([b812a3e](https://github.com/NelakaWith/gloire-road-map/commit/b812a3e6597dea9d6c906a4c84bb00358537cef3))
* integrate PrimeVue components and update LoginView with PrimeVue styling ([0af9be4](https://github.com/NelakaWith/gloire-road-map/commit/0af9be4eef16f34a1de46024f353f2128d4cc1d7))
* integrate Tailwind CSS for styling and enhance UI components ([8666c00](https://github.com/NelakaWith/gloire-road-map/commit/8666c006c26f9a8dbabbaccc4b65b9ad02608afc))
* refactor authentication to use userName instead of user_name in routes and views ([10392d1](https://github.com/NelakaWith/gloire-road-map/commit/10392d196b9c7f2e59b1d22404a5772c053babd4))
* refactor EditMemberModal to use reactive form handling and improve validation logic ([ff663a7](https://github.com/NelakaWith/gloire-road-map/commit/ff663a7d892d6adfe48bc40e6b3784e10fdc2c2b))
* rename StudentListView to MemberListView and implement member management functionality ([194e7f2](https://github.com/NelakaWith/gloire-road-map/commit/194e7f220d85792581eb8a340d295881711bf8b2))
* update deploy workflow to ensure NGINX live folder exists and copy build files ([6f9c70a](https://github.com/NelakaWith/gloire-road-map/commit/6f9c70ae519918cd4e13f85f892256326fd75298))
* update goal deletion process to use confirmation dialog and streamline handling ([f80a9a9](https://github.com/NelakaWith/gloire-road-map/commit/f80a9a9ac424105e16c055bf3787ea4ca980f06c))
* update login functionality to log userName and password attempts in auth routes and LoginView ([9416db6](https://github.com/NelakaWith/gloire-road-map/commit/9416db6dc95b01b033c842854fb705bbed72b719))
* update LoginView to use PrimeVue Form component and improve error handling ([69679ad](https://github.com/NelakaWith/gloire-road-map/commit/69679ad6516486f4afb16b5f3417d2e7b6b90979))
* update Node.js version to 20 in release workflow ([a701eac](https://github.com/NelakaWith/gloire-road-map/commit/a701eac2acbe759da53990bacded6814e8c33734))
* update User model and auth routes to include user_name for registration and login ([4282a1f](https://github.com/NelakaWith/gloire-road-map/commit/4282a1ffe12a358d98a316ba7b67ff09d1289a4e))


### Performance Improvements

* **app:** commitlint updated ([fed9089](https://github.com/NelakaWith/gloire-road-map/commit/fed908973392fb8bbcd7afb1fbdc835656876f90))
* commitlint updated ([2a64c1f](https://github.com/NelakaWith/gloire-road-map/commit/2a64c1ffd5f1831902774d9cf9bc875773142c76))
