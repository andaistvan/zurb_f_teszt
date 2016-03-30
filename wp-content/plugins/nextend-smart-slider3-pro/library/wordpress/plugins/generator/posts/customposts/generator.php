<?php

N2Loader::import('libraries.slider.generator.abstract', 'smartslider');

class N2GeneratorPostsCustomPosts extends N2GeneratorAbstract
{

    protected function _getData($count, $startIndex) {
        global $post;
        $tmpPost = $post;

        $taxonomies = explode('||', $this->data->get('taxonomies', ''));
        if (!in_array('0', $taxonomies)) {
            $tax_array = array();
            foreach ($taxonomies AS $tax) {
                $parts = explode('|*|', $tax);
                if (!is_array($tax_array[$parts[0]]) || !in_array($parts[1], $tax_array[$parts[0]])) {
                    $tax_array[$parts[0]][] = $parts[1];
                }
            }

            $tax_query = array();
            foreach ($tax_array AS $taxonomy => $terms) {
                $tax_query[] = array(
                    'taxonomy' => $taxonomy,
                    'terms'    => $terms,
                    'field'    => 'id'
                );
            }
            $tax_query['relation'] = 'OR';
        } else {
            $tax_query = '';
        }

        list($orderBy, $order) = N2Parse::parse($this->data->get('postsorder', 'post_date|*|desc'));

        $ids = $this->getIDs();
        if (count($ids) == 1 && $ids[0] == 0) {
            $posts = get_posts(array(
                'include'          => '',
                'exclude'          => '',
                'meta_key'         => '',
                'meta_value'       => '',
                'post_type'        => $this->info->post_type,
                'post_mime_type'   => '',
                'post_parent'      => '',
                'post_status'      => 'publish',
                'suppress_filters' => false,
                'offset'           => $startIndex,
                'posts_per_page'   => $count,
                'orderby'          => $orderBy,
                'order'            => $order,
                'tax_query'        => $tax_query
            ));
        } else {
            $posts = get_posts(array(
                'include'          => '',
                'exclude'          => '',
                'meta_key'         => '',
                'meta_value'       => '',
                'post_type'        => $this->info->post_type,
                'post_mime_type'   => '',
                'post_parent'      => '',
                'post_status'      => 'publish',
                'suppress_filters' => false,
                'offset'           => $startIndex,
                'posts_per_page'   => $count,
                'orderby'          => $orderBy,
                'order'            => $order,
                'tax_query'        => $tax_query,
                'post__in'         => $ids
            ));
        }

        $data = array();

        for ($i = 0; $i < count($posts); $i++) {
            $record = array();

            $post = $posts[$i];
            setup_postdata($post);

            $record['id'] = $post->ID;


            $record['url']         = get_permalink();
            $record['title']       = apply_filters('the_title', get_the_title());
            $record['description'] = $record['content'] = get_the_content();
            $record['author_name'] = $record['author'] = get_the_author();
            $record['author_url']  = get_the_author_meta('url');
            $record['date']        = get_the_date();
            $record['excerpt']     = get_the_excerpt();
            $record['modified']    = get_the_modified_date();

            $record['featured_image'] = wp_get_attachment_url(get_post_thumbnail_id($post->ID));
            if (!$record['featured_image']) $record['featured_image'] = '';

            $record['thumbnail'] = $record['image'] = $record['featured_image'];
            $record['url_label'] = 'View';

            $post_meta = get_post_meta($post->ID);
            if (count($post_meta)) {
                foreach ($post_meta AS $key => $value) {
                    foreach ($value AS $v) {
                        if (!empty($v)) {
                            $key          = str_replace(array(
                                '_',
                                '-'
                            ), array(
                                '',
                                ''
                            ), $key);
                            $record[$key] = $v;
                        }
                    }
                }
            }

            if (class_exists('acf')) {
                $fields = get_fields($post->ID);
                if (count($fields)) {
                    foreach ($fields AS $k => $v) {
                        $record[$k] = $v;
                    }
                }
            }

            $data[$i] = &$record;
            unset($record);
        }

        wp_reset_postdata();
        $post = $tmpPost;
        if ($post) setup_postdata($post);

        return $data;
    }
}
