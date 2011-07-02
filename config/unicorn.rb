# Launch using unicorn_rails -c config/unicorn.rb -D

# See http://unicorn.bogomips.org/Unicorn/Configurator.html for complete
# documentation.
worker_processes 1
working_directory "/home/berlin/sites/berlin.thirdside.ca"
listen "/home/berlin/sites/berlin.thirdside.ca/tmp/sockets/berlin.thirdside.ca.socket", :backlog => 64
timeout 30
user 'berlin', 'berlin'
pid "/home/berlin/sites/berlin.thirdside.ca/tmp/pids/unicorn.pid"
stderr_path "/home/berlin/sites/berlin.thirdside.ca/log/unicorn.stderr.log"
stdout_path "/home/berlin/sites/berlin.thirdside.ca/log/unicorn.stdout.log"
preload_app false
