# Launch using unicorn_rails -c unicorn.rb -D

# See http://unicorn.bogomips.org/Unicorn/Configurator.html for complete
# documentation.
worker_processes 1
working_directory "/home/berlin/sites/berlin.thirdside.ca"
listen "/tmp/berlin.thirdside.ca.socket", :backlog => 64
timeout 30
user 'www-data', 'www-data'
pid "/home/berlin/sites/berlin.thirdside.ca/tmp/pids/unicorn.pid"
stderr_path "/home/berlin/sites/berlin.thirdside.ca/log/unicorn.stderr.log"
stdout_path "/home/berlin/sites/berlin.thirdside.ca/log/unicorn.stdout.log"
preload_app true