require 'capistrano-unicorn'
require 'bundler/capistrano'

set :application, "berlin"
set :repository, "." 
set :scm, :none 
set :deploy_via, :copy 

# set :scm, :git # You can set :scm explicitly or Capistrano will make an intelligent guess based on known version control directory names
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

set :user, :berlin
set :use_sudo, false
server "berlin.thirdside.ca", :app, :web, :db, :primary => true

set :deploy_to, "/home/berlin/sites/berlin.thirdside.ca/"

# if you want to clean up old releases on each deploy uncomment this:
# after "deploy:restart", "deploy:cleanup"

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

 
namespace :foreman do
  desc "Export the Procfile to Ubuntu's upstart scripts"
  task :export, :roles => :app do
    run "cd #{deploy_to}/current && #{sudo} bundle exec foreman export upstart /etc/init -a #{application} -u #{user} -l #{deploy_to}/shared/logs/upstart.log"
  end
  
  desc "Start the application services"
  task :start, :roles => :app do
    run "#{sudo} start #{application}"
  end
 
  desc "Stop the application services"
  task :stop, :roles => :app do
    run "#{sudo} stop #{application}"
  end
 
  desc "Restart the application services"
  task :restart, :roles => :app do
    run "#{sudo} start #{application} || #{sudo} restart #{application}"
  end
end
 
after "deploy:update", "foreman:export"
after "deploy:update", "foreman:restart"