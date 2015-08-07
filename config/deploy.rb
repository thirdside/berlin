require 'capistrano-unicorn'
require 'bundler/capistrano'
require "delayed/recipes"

set :application, "berlin"
set :repository, "."
set :scm, :none
set :deploy_via, :copy
set :keep_releases, 5

# set :scm, :git # You can set :scm explicitly or Capistrano will make an intelligent guess based on known version control directory names
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

set :user, :berlin
set :app_user, :berlin
set :app_group, :berlin
set :use_sudo, false

set :default_shell, "bash -l"
set :rails_env, "production"

server "berlin.thirdside.ca", :app, :web, :db, :primary => true

set :deploy_to, "/home/berlin/sites/berlin.thirdside.ca/"

# if you want to clean up old releases on each deploy uncomment this:
# after "deploy:restart", "deploy:cleanup"

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# task :setup_group do
#   run "chown -R #{app_user}:#{app_group} #{deploy_to} && chmod -R g+s #{deploy_to}"
# end

namespace :deploy do
  namespace :assets do
    task :nodigest do
      run("cd #{current_release} && #{try_sudo} bundle exec rake assets:nodigest RAILS_ENV=production RAILS_GROUPS=assets")
    end
  end
end

after "deploy:start", "unicorn:start"
after "deploy:start",   "delayed_job:start"
after 'deploy:restart', 'unicorn:restart'
after "deploy:restart", "delayed_job:restart"
after "deploy:stop",    "delayed_job:stop"

after "deploy:assets:precompile", "deploy:assets:nodigest"
