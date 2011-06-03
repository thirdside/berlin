<?php

error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);

class Game
{
	public function __construct ($id, $map, $infos)
	{
		$this->id = $id;
		error_log("Creating game");
		$this->map = new Map($map, $infos);
	}
	
	public function update ($state)
	{
		$this->map->update($state);
	}
	
	public function turn_moves ()
	{
		$moves = array();
		foreach ($this->map->controlled_nodes() as $node)
		{
			
			$others = $node->adjacent_nodes();
			error_log(json_encode($others));
			if (count($others) > 1)
			{
				$move = array();
			
				$move['from']				= $node->id;
				$move['to']					= $others[rand(0, count($others - 1))];
				$move['number_of_soldiers']	= rand(0, $node->number_of_soldiers);
			
				$moves[] = $move;
			}
		}
		return $moves;
	}
}

class Map
{
	public function __construct ($map, $infos)
	{
		error_log("Creating Map");
		$this->player_id	= $infos->player_id;
		$this->nodes		= array();
		$this->is_directed	= $infos->directed ? $infos->directed : false;
		
		$types = array();
		foreach ($map->types as $t)
		{
			$types[$t->name] = $t;
		}
		
		foreach ($map->nodes as $node)
		{
			$this->nodes[$node->id] = new Node($node, $types[$node->type]);
		}

		foreach ($map->paths as $i => $path)
		{			
			$this->nodes[$path->from]->links[] = $this->nodes[$path->to];
			if (!$this->is_directed)
			{
				$this->nodes[$path->to]->links[] = $this->nodes[$path->from];
				error_log("undirected {$i}");
			}
		}
		
		//error_log("MAP: " . var_export($this, true));
		error_log("Map Created");
	}
	
	public function update ($state)
	{
		foreach ($state as $n)
		{
			$node						= $this->nodes[$n->node_id];
			$node->number_of_soldiers	= $n->number_of_soldiers;
			$node->player_id			= $n->player_id;
		}
	}
	
	public function owned_nodes ()
	{
		$owned = array();
		foreach ($this->nodes as $node)
		{
			if ($node->player_id == $this->player_id)
			{
				$owned[] = $node;
			}
		}
		return $owned;
	}
	
	public function controlled_nodes ()
	{
		$controlled = array();
		foreach ($this->owned_nodes() as $node)
		{
			if ($node->number_of_soldiers > 0)
			{
				$controlled[] = $node;
			}
		}
		return $controlled;
	}
}


class Node
{
	public function __construct ($node, $type_infos)
	{
		$this->id					= $node->id;
		$this->type					= $node->type;
		$this->points				= $type_infos->points;
		$this->soldiers_per_turn	= $type_infos->soldiers_per_turn;
		$this->number_of_soldiers	= 0;
		$this->player_id			= 0;
		$this->links				= array();
	}
	
	/*
	public function link_to ($other_node)
	{
		error_log("link to: " . var_export($other_node, true));
		$this->links[] = $other_node;
	}
	*/
	public function adjacent_nodes ()
	{
		$nodes = array();
		foreach ($this->links as $node)
		{
			$nodes[] = $node;
		}
		return $nodes;
	}
	
	public function is_adjacent ($other_node)
	{
		return in_array($other_node, $this->links);
	}
}

$action = $_POST['action'];
error_log($action);

if (in_array($action, array('turn', 'game_start', 'game_over')))
{
	$map	= json_decode($_POST['map']);
	$infos	= json_decode($_POST['infos']);
	$game	= new Game($infos->game_id, $map, $infos);
	
	error_log("Game Created");
	
	if ($_POST['state'])
	{
		$game->update(json_decode($_POST['state']));
	}
		
	if ($action == 'turn')
	{
		error_log("MOVES: " . json_encode($game->turn_moves()));
		echo json_encode($game->turn_moves());
	}
	
	error_log("toto");
}
